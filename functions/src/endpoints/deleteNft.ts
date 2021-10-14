import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import MultiArtToken from "../abis/MultiArtToken.json"
import provider from "../provider"

const deleteNft = https.onRequest((req, res) =>
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

			if (!req.body?.id) {
				res.status(400).end("Bad Payload")
				return
			}

			const {id} = req.body

			const nft = await admin.firestore().collection("nfts").doc(id).get()
			if (!nft.exists) {
				res.status(400).send("NFT does not exist")
				return
			}
			const nftContract = new Contract(nft.data()?.address, MultiArtToken.abi, provider)
			const owner = await nftContract.ownerOf(nft.data()?.id)
			if (owner.toLowerCase() !== user.toLowerCase()) {
				res.status(403).send("NFT does not belong to you")
				return
			}

			await admin.firestore().collection("nfts").doc(id).delete()

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default deleteNft
