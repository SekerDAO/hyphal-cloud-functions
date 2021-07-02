import {https} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"

const editDao = https.onRequest((req, res) =>
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

			if (!req.body?.address) {
				res.status(400).end("Bad Payload")
				return
			}

			const {address, name, description, website, twitter, telegram, discord, profileImage, headerImage} = req.body

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
				.where("role", "in", ["head", "admin"])
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			await admin
				.firestore()
				.collection("DAOs")
				.doc(address)
				.update({
					...(name !== undefined ? {name} : {}),
					...(description !== undefined ? {description} : {}),
					...(website !== undefined ? {website} : {}),
					...(twitter !== undefined ? {twitter} : {}),
					...(telegram !== undefined ? {telegram} : {}),
					...(discord !== undefined ? {discord} : {}),
					...(profileImage !== undefined ? {profileImage} : {}),
					...(headerImage !== undefined ? {headerImage} : {})
				})

			res.status(200).end("OK")
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export default editDao
