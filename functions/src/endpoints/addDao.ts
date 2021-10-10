import {InfuraProvider} from "@ethersproject/providers"
import {config, https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"
import {Contract} from "@ethersproject/contracts"
import GnosisSafe from "../abis/GnosisSafeL2.json"
import {isBigNumberish} from "@ethersproject/bignumber/lib/bignumber"

const provider = new InfuraProvider(config().infura.network, {
	projectId: config().infura.id,
	projectSecret: config().infura.secret
})

const addDao = https.onRequest((req, res) =>
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
			let userId: string
			let user: Record<string, string>
			const idToken = req.headers.authorization.split("Bearer ")[1]
			try {
				userId = (await admin.auth().verifyIdToken(idToken)).uid
				const userSnapshot = await admin.firestore().collection("users").doc(userId).get()
				if (!userSnapshot.exists) {
					res.status(401).send("Unauthorized")
					return
				}
				user = userSnapshot.data()!
			} catch (error) {
				res.status(401).send("Unauthorized")
				return
			}

			if (!req.body?.gnosisAddress) {
				res.status(400).end("Bad Payload")
				return
			}

			const {gnosisAddress} = req.body

			if (!isAddress(gnosisAddress)) {
				res.status(400).end("Bad Address")
				return
			}

			try {
				const safeContract = new Contract(gnosisAddress, GnosisSafe.abi, provider)
				const threshold = await safeContract.getThreshold()
				if (!isBigNumberish(threshold)) {
					res.status(400).send("No safe contract is deployed on this address")
					return
				}
			} catch (e) {
				res.status(400).send("No safe contract is deployed on this address")
				return
			}

			const dao = await admin.firestore().collection("DAOs").doc(gnosisAddress.toLowerCase()).get()
			if (!dao.exists) {
				// if DAO is not in our DB, add it
				await admin
					.firestore()
					.collection("DAOs")
					.doc(gnosisAddress.toLowerCase())
					.set({name: gnosisAddress, estimated: new Date().toISOString()})
			}

			// add DAO to user's favourites
			await admin
				.firestore()
				.collection("users")
				.doc(userId)
				.update({myDaos: [...user.myDaos, gnosisAddress]})

			res.status(200).send("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addDao
