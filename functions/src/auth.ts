import {https} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import Web3 from "web3"

const web3 = new Web3(Web3.givenProvider)

const auth = https.onRequest((req, res) =>
	cors()(req, res, async () => {
		try {
			if (req.method !== "POST") {
				res.status(400).end("Only POST method is supported")
				return
			}

			if (!(req.body?.account && req.body.token && req.body.signature)) {
				res.status(400).end("Bad Payload")
				return
			}

			if (!web3.utils.isAddress(req.body.account)) {
				res.status(400).end("Bad Address")
				return
			}

			const recoveredAccount = web3.eth.accounts.recover(
				JSON.stringify({account: req.body.account, token: req.body.token}),
				req.body.signature
			)
			if (req.body.account !== recoveredAccount) {
				res.sendStatus(401)
				return
			}

			const user = await admin.firestore().collection("users").doc(req.body.account).get()
			if (user.exists) {
				await admin.firestore().collection("users").doc(req.body.account).update({lastSeen: new Date().toISOString()})
			} else {
				await admin.firestore().collection("users").doc(req.body.account).set({lastSeen: new Date().toISOString()})
			}

			const firebaseToken = await admin.auth().createCustomToken(req.body.account)
			res.status(200).json({token: firebaseToken})
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export default auth
