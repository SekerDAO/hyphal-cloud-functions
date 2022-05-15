export type NFTMediaInfo = {
	dimensions: string
	mimeType: string
	size: number
	uri: string
}

export type NFTMetadata = {
	name: string
	description: string
	image: string
	external_url: string
	media: NFTMediaInfo
	attributes: Record<string, string | number | boolean>
}

export type NFT = {
	id: number
	address: string
	createdDate: string
	name: string
	thumbnail?: string
	desc?: string
	externalUrl?: string
	media?: NFTMediaInfo
	attributes?: Record<string, string | number | boolean>
	owner: string
	creator: string
	ownerType: "user" | "dao"
}
