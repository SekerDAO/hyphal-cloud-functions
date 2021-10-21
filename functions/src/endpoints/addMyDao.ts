import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {validateDao} from "../schemas/Dao"

const addMyDao = https.onRequest((req, res) =>
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

			if (!validateDao(req.body?.dao)) {
				res.status(400).end("Bad Payload")
				return
			}

			const {dao} = req.body

			const userSnapshot = await admin.firestore().collection("users").doc(user).get()

			await admin
				.firestore()
				.collection("users")
				.doc(user)
				.update({
					myDaos: [...(userSnapshot.data()?.myDaos ?? []), dao]
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addMyDao
