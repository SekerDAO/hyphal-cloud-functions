import {https, logger} from "firebase-functions"
import cors from "cors"
import admin from "firebase-admin"
import {Contract} from "@ethersproject/contracts"
import provider from "../provider"
import MultiArtToken from "../abis/MultiArtToken.json"
import {validateNft} from "../schemas/Nft"

const addNft = https.onRequest((req, res) =>
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

			if (!validateNft(req.body?.nft)) {
				res.status(400).end(JSON.stringify(validateNft.errors))
			}

			const {nft} = req.body

			const nftContract = new Contract(nft.address, MultiArtToken.abi, provider)
			const owner = await nftContract.ownerOf(nft.id)
			if (owner.toLowerCase() !== user.toLowerCase()) {
				res.status(403).send("NFT does not belong to you")
				return
			}

			await admin
				.firestore()
				.collection("nfts")
				.add({
					...nft,
					owner: user.toLowerCase(),
					ownerType: "user"
				})

			res.status(200).end("OK")
		} catch (e) {
			logger.error(e)
			res.sendStatus(500)
		}
	})
)

export default addNft
