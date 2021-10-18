import {JSONSchemaType} from "ajv"
import ajv from "."
import {NFT} from "../types/Nft"

export type NFTSchemaType = Omit<NFT, "owner" | "ownerType" | "createdDate" | "media" | "attributes">
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
		creator: {
			type: "string",
			format: "address"
		}
	},
	required: ["address", "id", "name", "creator"]
}

export const validateNft = ajv.compile(NFTSchema)
