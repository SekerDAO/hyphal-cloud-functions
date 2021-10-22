import {JSONSchemaType} from "ajv"
import ajv from "./"
import {Dao} from "../types/Dao"

export const DaoSchema: JSONSchemaType<Dao> = {
	type: "object",
	properties: {
		gnosisAddress: {
			type: "string",
			format: "address"
		},
		name: {
			type: "string",
			nullable: true
		},
		estimated: {type: "string", nullable: true},
		description: {type: "string", nullable: true},
		website: {type: "string", nullable: true},
		twitter: {type: "string", nullable: true},
		telegram: {type: "string", nullable: true},
		discord: {type: "string", nullable: true},
		profileImage: {type: "string", nullable: true},
		headerImage: {type: "string", nullable: true},
		seeleAddress: {type: "string", nullable: true, format: "address"}
	},
	required: ["gnosisAddress"]
}

export const validateDao = ajv.compile(DaoSchema)
