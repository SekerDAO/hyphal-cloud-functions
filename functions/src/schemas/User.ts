import {JSONSchemaType} from "ajv"
import ajv from "./"
import {Domain} from "../types/User"

export const DomainSchema: JSONSchemaType<Domain> = {
	type: "object",
	properties: {
		name: {
			type: "string"
		},
		symbol: {
			type: "string"
		},
		address: {
			type: "string"
		}
	},
	required: ["name", "symbol", "address"]
}

export const validateDomain = ajv.compile(DomainSchema)
