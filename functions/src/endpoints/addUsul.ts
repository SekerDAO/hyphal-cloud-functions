import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"
import {Contract} from "@ethersproject/contracts"
import GnosisSafe from "../abis/GnosisSafeL2.json"
import provider from "../provider"

const addUsul = https.onRequest((req, res) =>
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

			if (!(req.body?.gnosisAddress && req.body.usul?.usulAddress && req.body.usul.deployType)) {
				res.status(400).end("Bad Payload")
				return
			}
			if (!isAddress(req.body.gnosisAddress)) {
				res.status(400).end("Bad Gnosis Address")
				return
			}
			if (!isAddress(req.body.usul.usulAddress)) {
				res.status(400).end("Bad Usul Address")
				return
			}

			// TODO: add schema validation

			const {gnosisAddress, usul} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(gnosisAddress.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			// TODO: check strategy members
			const safeContract = new Contract(gnosisAddress, GnosisSafe.abi, provider)
			const addresses: string[] = await safeContract.getOwners()
			if (!addresses.find(addr => addr.toLowerCase() === user.toLowerCase())) {
				res.status(403).send("Forbidden")
				return
			}

			await admin
				.firestore()
				.collection("DAOs")
				.doc(gnosisAddress.toLowerCase())
				.update({
					usuls: [...dao.data()!.usuls, usul]
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addUsul