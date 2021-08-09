import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"

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

			if (!req.body?.gnosisAddress) {
				res.status(400).end("Bad Payload")
				return
			}
			if (!isAddress(req.body.gnosisAddress)) {
				res.status(400).end("Bad Address")
				return
			}

			const {
				daoAddress,
				tokenAddress,
				totalSupply,
				decisionMakingSpeed,
				tax,
				minProposalAmount,
				daoVotingThreshold,
				name,
				description,
				website,
				twitter,
				telegram,
				discord,
				gnosisAddress,
				profileImage,
				headerImage
			} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(gnosisAddress).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", gnosisAddress.toLowerCase())
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
				.doc(gnosisAddress.toLowerCase())
				.update({
					...(daoAddress !== undefined ? {daoAddress: daoAddress.toLowerCase()} : {}),
					...(tokenAddress !== undefined ? {tokenAddress: tokenAddress.toLowerCase()} : {}),
					...(totalSupply !== undefined ? {totalSupply} : {}),
					...(decisionMakingSpeed !== undefined ? {decisionMakingSpeed} : {}),
					...(tax !== undefined ? {tax} : {}),
					...(minProposalAmount !== undefined ? {minProposalAmount} : {}),
					...(daoVotingThreshold !== undefined ? {daoVotingThreshold} : {}),
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
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default editDao
