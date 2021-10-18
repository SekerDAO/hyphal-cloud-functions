import {JSONSchemaType} from "ajv"
import ajv from "./"
import {DaoNft} from "../types/Dao"
import {NFTSchema, NFTSchemaType} from "./Nft"

type DaoNFTSchema = Omit<DaoNft, "nft"> & {nft: NFTSchemaType}
export const DaoNftSchema: JSONSchemaType<DaoNFTSchema> = {
	type: "object",
	properties: {
		address: {
			type: "string",
			format: "address"
		},
		nft: NFTSchema
	},
	required: ["address"],
	additionalProperties: false
}

export const validateDaoNft = ajv.compile(DaoNftSchema)
