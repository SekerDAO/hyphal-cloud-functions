import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import GnosisSafe from "../abis/GnosisSafeL2.json"
import provider from "../provider"
import {validateSafeProposal} from "../schemas/SafeProposal"

const addSafeProposal = https.onRequest((req, res) =>
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

			if (!validateSafeProposal(req.body)) {
				res.status(400).end(JSON.stringify(validateSafeProposal.errors))
			}

			const {
				gnosisAddress,
				title,
				description,
				state,
				type,
				amount,
				recipientAddress,
				newRole,
				balance,
				newThreshold,
				signatures,
				signaturesStep2,
				auctionId,
				nftId,
				nftAddress,
				duration,
				reservePrice,
				auctionCurrencySymbol,
				auctionCurrencyAddress,
				transactions,
				daoVotingThreshold,
				gracePeriod,
				usulAddress,
				multiTx,
				nonce,
				usulDeployType,
				bridgeAddress,
				sideNetSafeAddress
			} = req.body

			const safeContract = new Contract(gnosisAddress, GnosisSafe.abi, provider)
			const addresses: string[] = await safeContract.getOwners()
			if (!(type === "decentralizeDAO" || addresses.find(addr => addr.toLowerCase() === user.toLowerCase()))) {
				res.status(403).send("Forbidden")
				return
			}

			await admin
				.firestore()
				.collection("safeProposals")
				.add({
					gnosisAddress: gnosisAddress.toLowerCase(),
					userAddress: user.toLowerCase(),
					title,
					...(description === undefined ? {} : {description}),
					state,
					type,
					...(amount === undefined ? {} : {amount}),
					...(recipientAddress === undefined ? {} : {recipientAddress}),
					...(newRole === undefined ? {} : {newRole}),
					...(balance === undefined ? {} : {balance}),
					...(newThreshold === undefined ? {} : {newThreshold}),
					signatures,
					...(signaturesStep2 === undefined ? {} : {signaturesStep2}),
					...(auctionId === undefined ? {} : {auctionId}),
					...(nftId === undefined ? {} : {nftId}),
					...(nftAddress === undefined ? {} : {nftAddress}),
					...(duration === undefined ? {} : {duration}),
					...(reservePrice === undefined ? {} : {reservePrice}),
					...(auctionCurrencySymbol === undefined ? {} : {auctionCurrencySymbol}),
					...(auctionCurrencyAddress === undefined ? {} : {auctionCurrencyAddress}),
					...(transactions === undefined ? {} : {transactions}),
					...(daoVotingThreshold === undefined ? {} : {daoVotingThreshold}),
					...(gracePeriod === undefined ? {} : {gracePeriod}),
					...(usulAddress === undefined ? {} : {usulAddress}),
					...(multiTx === undefined ? {} : {multiTx}),
					...(nonce === undefined ? {} : {nonce}),
					...(usulDeployType === undefined ? {} : {usulDeployType}),
					...(bridgeAddress === undefined ? {} : {bridgeAddress}),
					...(sideNetSafeAddress === undefined ? {} : {sideNetSafeAddress})
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addSafeProposal
