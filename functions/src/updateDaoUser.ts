import {config, https} from "firebase-functions"
import cors from "cors"
import {Contract} from "@ethersproject/contracts"
import HouseTokenDAO from "./abis/HouseTokenDAO.json"
import admin from "firebase-admin"
import {InfuraProvider} from "@ethersproject/providers"
import {isAddress} from "@ethersproject/address"

const provider = new InfuraProvider(config().infura.network, {
	projectId: config().infura.id,
	projectSecret: config().infura.secret
})

const updateDaoUser = https.onRequest((req, res) =>
	cors()(req, res, async () => {
		try {
			if (req.method !== "POST") {
				res.status(400).end("Only POST method is supported")
				return
			}

			if (!(req.body?.daoAddress && req.body.memberAddress)) {
				res.status(400).end("Bad Payload")
				return
			}
			if (!isAddress(req.body.daoAddress)) {
				res.status(400).end("Bad DAO Address")
				return
			}
			if (!isAddress(req.body.memberAddress)) {
				res.status(400).end("Bad Member Address")
				return
			}

			const {daoAddress, memberAddress} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(daoAddress).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}
			const {type} = dao.data()!

			const daoContract = new Contract(daoAddress, HouseTokenDAO.abi, provider)
			const member = await daoContract.members(memberAddress)
			const role = member
				? member.roles.headOfHouse
					? type === "house"
						? "head"
						: "admin"
					: member.roles.member
					? "member"
					: null
				: null
			const userRoleSnapshot = await admin
				.firestore()
				.collection("daoUsers")
				.where("address", "==", memberAddress)
				.get()
			const oldRole = userRoleSnapshot.empty ? null : userRoleSnapshot.docs[0].data().role

			if (role === oldRole) {
				res.status(400).end("User role is already set")
				return
			}

			if (role) {
				if (oldRole) {
					await admin.firestore().collection("daoUsers").doc(userRoleSnapshot.docs[0].id).update({
						role
					})
				} else {
					await admin.firestore().collection("daoUsers").add({
						address: memberAddress,
						dao: daoAddress,
						memberSince: new Date().toISOString(),
						role
					})
				}
			} else {
				await admin.firestore().collection("daoUsers").doc(userRoleSnapshot.docs[0].id).delete()
			}

			res.sendStatus(200)
		} catch (e) {
			console.error(e)
			res.sendStatus(500)
		}
	})
)

export default updateDaoUser
