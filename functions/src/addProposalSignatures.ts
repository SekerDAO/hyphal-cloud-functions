import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"

const addProposalSignatures = https.onRequest((req, res) =>
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

			if (!(req.body?.proposalId && req.body.signature)) {
				res.status(400).end("Bad Payload")
				return
			}

			const {proposalId, signature, signatureStep2, newState} = req.body

			const proposal = await admin.firestore().collection("proposals").doc(proposalId).get()
			if (!proposal.exists) {
				res.status(400).end("DAO not found")
				return
			}
			const {gnosisAddress, signatures, signaturesStep2} = proposal.data()!

			const member = await admin
				.firestore()
				.collection("daoUsers")
				.where("dao", "==", gnosisAddress)
				.where("address", "==", user)
				.where("role", "in", ["admin", "head"])
				.get()
			if (member.empty) {
				res.status(403).send("Forbidden")
				return
			}

			await admin
				.firestore()
				.collection("proposals")
				.doc(proposalId)
				.update({
					signatures: [...signatures, signature],
					...(signatureStep2 ? {signaturesStep2: [...signaturesStep2, signatureStep2]} : {}),
					...(newState ? {state: newState} : {})
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addProposalSignatures
