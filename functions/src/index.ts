import {https} from "firebase-functions"
import admin from "firebase-admin"
import Web3 from "web3"
import cors from "cors"

admin.initializeApp({
	serviceAccountId: "token-walk@appspot.gserviceaccount.com"
})
const web3 = new Web3(Web3.givenProvider)

export const auth = https.onRequest((req, res) =>
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

			const account = web3.utils.toChecksumAddress(req.body.account)
			const recoveredAccount = web3.eth.accounts.recover(
				JSON.stringify({account: req.body.account, token: req.body.token}),
				req.body.signature
			)
			if (account !== recoveredAccount) {
				res.sendStatus(401)
				return
			}

			await admin.firestore().collection("users").doc(account).set({lastSeen: new Date().toISOString()})

			const firebaseToken = await admin.auth().createCustomToken(account)
			res.status(200).json({token: firebaseToken})
		} catch (e) {
			res.sendStatus(500)
		}
	})
)
