import {JSONSchemaType} from "ajv"
import ajv from "./"
import {Usul} from "../types/Usul"

const UsulSchema: JSONSchemaType<Usul> = {
	type: "object",
	properties: {
		usulAddress: {
			type: "string",
			format: "address"
		},
		deployType: {
			type: "string",
			enum: ["usulMulti", "usulSingle"]
		},
		bridgeAddress: {
			type: "string",
			format: "address",
			nullable: true
		},
		sideNetSafeAddress: {
			type: "string",
			format: "address",
			nullable: true
		}
	},
	required: ["usulAddress", "deployType"]
}

export const validateUsul = ajv.compile(UsulSchema)
