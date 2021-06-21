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

			const recoveredAccount = web3.eth.accounts.recover(
				JSON.stringify({account: req.body.account, token: req.body.token}),
				req.body.signature
			)
			if (req.body.account !== recoveredAccount) {
				res.sendStatus(401)
				return
			}

			await admin.firestore().collection("users").doc(req.body.account).set({lastSeen: new Date().toISOString()})

			const firebaseToken = await admin.auth().createCustomToken(req.body.account)
			res.status(200).json({token: firebaseToken})
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export const addDaoNft = https.onRequest((req, res) =>
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

			if (!(req.body?.address && req.body.nft)) {
				res.status(400).end("Bad Payload")
				return
			}

			const {address, nft} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(address).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", address)
				.where("address", "==", user)
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			await admin
				.firestore()
				.collection("nfts")
				.add({
					...nft,
					nftAdminUserUID: address
				})

			res.status(200).end("OK")
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)
