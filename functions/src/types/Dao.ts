import {NFT} from "./Nft"

export type Dao = {
	gnosisAddress: string
	name?: string
	estimated?: string
	// Optional properties, only present in Firebase
	description?: string
	website?: string
	twitter?: string
	telegram?: string
	discord?: string
	profileImage?: string
	headerImage?: string
	// Created after deploying Seele module
	usulAddress?: string
}

export type DaoNft = {
	address: string
	nft: NFT
}
