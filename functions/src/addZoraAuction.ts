import {https} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"

const addZoraAuction = https.onRequest((req, res) =>
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

			if (
				!(
					req.body?.id &&
					req.body.gnosisAddress &&
					req.body.nftAddress &&
					req.body.nftId &&
					req.body.nftName &&
					req.body.duration &&
					req.body.reservePrice != null &&
					req.body.curatorAddress &&
					req.body.curatorFeePercentage &&
					req.body.tokenSymbol &&
					req.body.tokenAddress
				)
			) {
				res.status(400).end("Bad Payload")
				return
			}
			if (
				!(
					isAddress(req.body.gnosisAddress) &&
					isAddress(req.body.nftAddress) &&
					isAddress(req.body.curatorAddress) &&
					isAddress(req.body.tokenAddress)
				)
			) {
				res.status(400).end("Bad DAO Address")
				return
			}

			const {
				id,
				gnosisAddress,
				nftAddress,
				nftId,
				nftName,
				duration,
				reservePrice,
				curatorAddress,
				curatorFeePercentage,
				tokenSymbol,
				tokenAddress
			} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(gnosisAddress).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", gnosisAddress)
				.where("address", "==", user)
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			await admin.firestore().collection("zoraAuctions").add({
				id,
				gnosisAddress,
				nftAddress,
				nftId,
				nftName,
				duration,
				reservePrice,
				curatorAddress,
				curatorFeePercentage,
				tokenSymbol,
				tokenAddress,
				approved: false,
				canceled: false,
				creationDate: new Date().toISOString()
			})

			res.status(200).end("OK")
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export default addZoraAuction
