import {https} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"

const approveZoraAuction = https.onRequest((req, res) =>
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

			const auctionSnapshot = await admin.firestore().collection("zoraAuctions").where("id", "==", req.body.id).get()
			if (auctionSnapshot.empty) {
				res.status(400).end("Auction not found")
				return
			}
			const auction = auctionSnapshot.docs[0].data()

			const dao = await admin.firestore().collection("DAOs").doc(auction.gnosisAddress).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", auction.gnosisAddress)
				.where("address", "==", user)
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			await admin.firestore().collection("zoraAuctions").doc(auctionSnapshot.docs[0].id).update({approved: true})

			res.status(200).end("OK")
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export default approveZoraAuction
