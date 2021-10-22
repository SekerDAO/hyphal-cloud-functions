import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {verifyMessage} from "@ethersproject/wallet"
import {validateAuth} from "../schemas/User"

const auth = https.onRequest((req, res) =>
	cors()(req, res, async () => {
		try {
			if (req.method !== "POST") {
				res.status(400).end("Only POST method is supported")
				return
			}

			if (!validateAuth(req.body)) {
				res.status(400).end("Bad Payload")
				return
			}

			const recoveredAccount = verifyMessage(
				JSON.stringify({account: req.body.account.toLowerCase(), token: req.body.token}),
				req.body.signature
			)
			if (req.body.account.toLowerCase() !== recoveredAccount.toLowerCase()) {
				res.sendStatus(401)
				return
			}

			const user = await admin.firestore().collection("users").doc(req.body.account.toLowerCase()).get()
			if (user.exists) {
				await admin.firestore().collection("users").doc(req.body.account.toLowerCase()).update({
					lastSeen: new Date().toISOString()
				})
			} else {
				await admin
					.firestore()
					.collection("users")
					.doc(req.body.account.toLowerCase())
					.set({lastSeen: new Date().toISOString(), myDaos: [], myDomains: []})
			}

			const firebaseToken = await admin.auth().createCustomToken(req.body.account.toLowerCase())
			res.status(200).json({token: firebaseToken})
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default auth
