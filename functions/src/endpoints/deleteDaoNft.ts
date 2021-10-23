import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import GnosisSafe from "../abis/GnosisSafeL2.json"
import provider from "../provider"
import MultiArtToken from "../abis/MultiArtToken.json"
import {validateDeleteDaoNft} from "../schemas/DaoNft"

const deleteDaoNft = https.onRequest((req, res) =>
	cors()(req, res, async () => {
		try {
			if (req.method !== "POST") {
				res.status(400).end("Only POST method is supported")
				return
			}

			if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer "))) {
				res.status(401).send("Unauthorized")
				return
			}
			let user: string
			const idToken = req.headers.authorization.split("Bearer ")[1]
			try {
				user = (await admin.auth().verifyIdToken(idToken)).uid
			} catch (error) {
				res.status(401).send("Unauthorized")
				return
			}

			if (!validateDeleteDaoNft(req.body)) {
				res.status(400).end(JSON.stringify(validateDeleteDaoNft.errors))
			}

			const {address, nftId} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(address.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const safeContract = new Contract(address, GnosisSafe.abi, provider)
			const addresses: string[] = await safeContract.getOwners()
			if (!addresses.find(addr => addr.toLowerCase() === user.toLowerCase())) {
				res.status(403).send("Forbidden")
				return
			}

			const nft = await admin.firestore().collection("nfts").doc(nftId).get()
			if (!nft.exists) {
				res.status(400).send("NFT does not exist")
				return
			}
			const nftContract = new Contract(nft.data()?.address, MultiArtToken.abi, provider)
			const owner = await nftContract.ownerOf(nft.data()?.id)
			if (owner.toLowerCase() !== address.toLowerCase()) {
				res.status(403).send("NFT does not belong to this DAO")
				return
			}

			await admin.firestore().collection("nfts").doc(nftId).delete()

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default deleteDaoNft
