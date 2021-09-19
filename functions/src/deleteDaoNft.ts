import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"

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

			if (!(req.body?.address && req.body.nftId)) {
				res.status(400).end("Bad Payload")
				return
			}
			if (!isAddress(req.body.address)) {
				res.status(400).end("Bad DAO Address")
				return
			}

			const {address, nftId} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(address.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", address.toLowerCase())
				.where("address", "==", user)
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			const nft = await admin.firestore().collection("nfts").doc(nftId).get()
			if (!nft.exists) {
				res.status(400).send("NFT does not exist")
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
