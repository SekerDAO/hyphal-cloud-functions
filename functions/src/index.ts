import {https} from "firebase-functions"
import admin from "firebase-admin"
import Web3 from "web3"
import Cors from "cors"

admin.initializeApp({
	// serviceAccountId: 'firebase-adminsdk-b69gn@token-walk.iam.gserviceaccount.com',
	serviceAccountId: "token-walk@appspot.gserviceaccount.com"
})
const web3 = new Web3(Web3.givenProvider)
const cors = Cors()

export const auth = https.onRequest((req, res) => {
	try {
		return cors(req, res, async () => {
			if (req.method !== "POST") {
				res.status(400).end("Only POST method is supported")
				return
			}

			const body = JSON.parse(req.body)

			if (!(body?.account && body.token && body.signature)) {
				res.status(400).end("Bad Payload")
				return
			}

			if (!web3.utils.isAddress(body.account)) {
				res.status(400).end("Bad Address")
				return
			}

			const account = web3.utils.toChecksumAddress(body.account)
			const recoveredAccount = web3.eth.accounts.recover(
				JSON.stringify({account: body.account, token: body.token}),
				body.signature
			)
			if (account !== recoveredAccount) {
				res.sendStatus(401)
				return
			}

			const firebaseToken = await admin.auth().createCustomToken(account)
			res.status(200).json({token: firebaseToken})
		})
	} catch (error) {
		res.sendStatus(500)
	}
})
