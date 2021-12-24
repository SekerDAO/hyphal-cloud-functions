import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"

const removeMyDao = https.onRequest((req, res) =>
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

			if (!req.body?.dao) {
				res.status(400).end("Bad Payload")
				return
			}

			const {dao} = req.body

			const userSnapshot = await admin.firestore().collection("users").doc(user).get()

			if (
				!userSnapshot
					.data()!
					.myDaos.map((_dao: string) => _dao.toLowerCase())
					.includes(dao.toLowerCase())
			) {
				res.status(400).end("Dao not found")
			}

			await admin
				.firestore()
				.collection("users")
				.doc(user)
				.update({
					myDaos: userSnapshot.data()!.myDaos.filter((_dao: string) => _dao.toLowerCase() !== dao.toLowerCase())
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default removeMyDao
