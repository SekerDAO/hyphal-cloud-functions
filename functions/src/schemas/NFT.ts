import {JSONSchemaType} from "ajv"
import ajv from "./"
import {NFT, NFTMediaInfo} from "../types/Nft"

export const NFTMediaSchema: JSONSchemaType<NFTMediaInfo> = {
	type: "object",
	properties: {
		dimensions: {
			type: "string"
		},
		mimeType: {
			type: "string"
		},
		size: {
			type: "number"
		},
		uri: {
			type: "string"
		}
	},
	required: ["dimensions", "mimeType", "size", "uri"]
}

export type NFTSchemaType = Omit<NFT, "owner" | "ownerType" | "createdDate">
export const NFTSchema: JSONSchemaType<NFTSchemaType> = {
	type: "object",
	properties: {
		address: {
			type: "string",
			format: "address"
		},
		id: {
			type: "integer"
		},
		name: {
			type: "string"
		},
		creator: {
			type: "string",
			format: "address"
		},
		thumbnail: {
			type: "string",
			nullable: true
		},
		desc: {
			type: "string",
			nullable: true
		},
		externalUrl: {
			type: "string",
			nullable: true
		},
		attributes: {
			nullable: true,
			type: "object",
			required: []
		},
		media: {
			...NFTMediaSchema,
			nullable: true
		}
	},
	required: ["address", "id", "name", "creator"]
}

export const DeleteNFTSchema: JSONSchemaType<{id: string}> = {
	type: "object",
	properties: {
		id: {
			type: "string"
		}
	},
	required: ["id"]
}

export const validateNft = ajv.compile(NFTSchema)
export const validateDeleteNft = ajv.compile(DeleteNFTSchema)
