import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {validateStrategyProposal} from "../schemas/StrategyProposal"

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

			if (!validateStrategyProposal(req.body)) {
				res.status(400).end(JSON.stringify(validateStrategyProposal.errors))
			}

			const {
				gnosisAddress,
				usulAddress,
				strategyAddress,
				strategyType,
				type,
				id,
				transactions,
				title,
				description,
				newUsulAddress,
				sideNetSafeAddress,
				bridgeAddress,
				sideChain
			} = req.body

			await admin
				.firestore()
				.collection("strategyProposals")
				.add({
					gnosisAddress: gnosisAddress.toLowerCase(),
					usulAddress: usulAddress.toLowerCase(),
					strategyAddress: strategyAddress.toLowerCase(),
					strategyType,
					type,
					id,
					transactions,
					userAddress: user.toLowerCase(),
					title,
					...(description === undefined ? {} : {description}),
					...(newUsulAddress === undefined ? {} : {newUsulAddress}),
					...(sideNetSafeAddress === undefined ? {} : {sideNetSafeAddress}),
					...(bridgeAddress === undefined ? {} : {bridgeAddress}),
					...(sideChain === undefined ? {} : {sideChain})
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addStrategyProposal
