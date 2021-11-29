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
					req.body.contractAddress &&
					req.body.contractAbi &&
					req.body.contractMethod &&
					req.body.args &&
					req.body.title &&
					req.body.state
				)
			) {
				res.status(400).end("Bad Payload")
				return
			}

			const {
				gnosisAddress,
				strategyAddress,
				strategyType,
				contractAddress,
				contractAbi,
				contractMethod,
				args,
				title,
				description,
				state
			} = req.body

			await admin
				.firestore()
				.collection("strategyProposals")
				.add({
					gnosisAddress,
					strategyAddress,
					strategyType,
					contractAddress,
					contractAbi,
					contractMethod,
					args,
					userAddress: user.toLowerCase(),
					title,
					...(description === undefined ? {} : {description}),
					state
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addStrategyProposal
