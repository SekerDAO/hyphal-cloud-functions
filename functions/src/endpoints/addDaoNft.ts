import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import provider from "../provider"
import MultiArtToken from "../abis/MultiArtToken.json"
import {validateDaoNft} from "../schemas/DaoNft"

const addDaoNft = https.onRequest((req, res) =>
	cors()(req, res, async () => {
		try {
			if (req.method !== "POST") {
				res.status(405).end("Only POST method is supported")
				return
			}

			if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer "))) {
				res.status(401).send("Unauthorized")
				return
			}

			const idToken = req.headers.authorization.split("Bearer ")[1]
			try {
				await admin.auth().verifyIdToken(idToken)
			} catch (error) {
				res.status(401).send("Unauthorized")
				return
			}

			if (!validateDaoNft(req.body)) {
				res.status(400).end(JSON.stringify(validateDaoNft.errors))
			}

			const {address, nft} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(address.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const nftContract = new Contract(nft.address, MultiArtToken.abi, provider)
			const owner = await nftContract.ownerOf(nft.id)
			if (owner.toLowerCase() !== address.toLowerCase()) {
				res.status(403).send("NFT does not belong to this DAO")
				return
			}

			await admin
				.firestore()
				.collection("nfts")
				.add({
					...nft,
					owner: address.toLowerCase(),
					ownerType: "dao"
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addDaoNft
