import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import GnosisSafeL2 from "../abis/GnosisSafeL2.json"
import provider from "../provider"
import {validateUsul} from "../schemas/Usul"

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
			const idToken = req.headers.authorization.split("Bearer ")[1]
			try {
				await admin.auth().verifyIdToken(idToken)
			} catch (error) {
				res.status(401).send("Unauthorized")
				return
			}

			if (!validateUsul(req.body)) {
				res.status(400).end(JSON.stringify(validateUsul.errors))
			}

			const {gnosisAddress, usul} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(gnosisAddress.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const safeContract = new Contract(gnosisAddress, GnosisSafeL2.abi, provider)
			const modules = await safeContract.getModulesPaginated(
				"0x0000000000000000000000000000000000000001",
				20 // TODO: ideally this should not be hardcoded, but is there any other way?
				// And is it reasonable to have more than 20 Usuls on a safe?
			)
			const moduleAddress = usul.deployType === "usulMulti" ? usul.bridgeAddress : usul.usulAddress
			if (!modules[0].find((module: string) => module.toLowerCase() === moduleAddress.toLowerCase())) {
				res.status(400).send("No such module on this safe")
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
