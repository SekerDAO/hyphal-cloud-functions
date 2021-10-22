import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {validateUser} from "../schemas/User"

const editUser = https.onRequest((req, res) =>
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

			if (!validateUser(req.body)) {
				res.status(400).end("Unexpected empty body")
				return
			}

			const {name, url, bio, location, email, website, twitter, instagram, profileImage, headerImage} = req.body

			await admin
				.firestore()
				.collection("users")
				.doc(user)
				.update({
					...(name === undefined ? {} : {name}),
					...(url === undefined ? {} : {url}),
					...(bio === undefined ? {} : {bio}),
					...(location === undefined ? {} : {location}),
					...(email === undefined ? {} : {email}),
					...(website === undefined ? {} : {website}),
					...(twitter === undefined ? {} : {twitter}),
					...(instagram === undefined ? {} : {instagram}),
					...(profileImage === undefined ? {} : {profileImage}),
					...(headerImage === undefined ? {} : {headerImage})
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default editUser
