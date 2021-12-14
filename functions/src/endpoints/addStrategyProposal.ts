import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"

const addStrategyProposal = https.onRequest((req, res) =>
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

			if (
				!(
					req.body?.gnosisAddress &&
					req.body.strategyAddress &&
					req.body.strategyType &&
					req.body.transactions &&
					req.body.title &&
					req.body.id != undefined
				)
			) {
				res.status(400).end("Bad Payload")
				return
			}

			const {gnosisAddress, strategyAddress, strategyType, id, transactions, title, description} = req.body

			await admin
				.firestore()
				.collection("strategyProposals")
				.add({
					gnosisAddress,
					strategyAddress,
					strategyType,
					id,
					transactions,
					userAddress: user.toLowerCase(),
					title,
					...(description === undefined ? {} : {description})
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addStrategyProposal
