import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {isAddress} from "@ethersproject/address"
import {Contract} from "@ethersproject/contracts"
import provider from "../provider"
import MultiArtToken from "../abis/MultiArtToken.json"

const addDaoNft = https.onRequest((req, res) =>
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

			// TODO: schema validation
			if (!(req.body?.address && req.body.nft && req.body.nft.id && req.body.nft.address)) {
				res.status(400).end("Bad Payload")
				return
			}
			if (!isAddress(req.body.address)) {
				res.status(400).end("Bad DAO Address")
				return
			}

			const {address, nft} = req.body

			const dao = await admin.firestore().collection("DAOs").doc(address.toLowerCase()).get()
			if (!dao.exists) {
				res.status(400).end("DAO not found")
				return
			}

			const nftContract = new Contract(nft.address, MultiArtToken.abi, provider)
			const owner = await nftContract.ownerOf(nft.id)
			if (owner.toLowerCase() !== address.toLowerCase()) {
				res.status(403).send("NFT does not belong to this DAO")
				return
			}

			await admin
				.firestore()
				.collection("nfts")
				.add({
					...nft,
					owner: address.toLowerCase(),
					ownerType: "dao"
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addDaoNft
