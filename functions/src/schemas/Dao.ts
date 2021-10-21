import {JSONSchemaType} from "ajv"
import ajv from "./"
import {Dao} from "../types/Dao"

export const DaoSchema: JSONSchemaType<Dao> = {
	type: "object",
	properties: {
		gnosisAddress: {
			type: "string",
			format: "address"
		}
	},
	required: ["gnosisAddress"]
}

export const validateDao = ajv.compile(DaoSchema)
