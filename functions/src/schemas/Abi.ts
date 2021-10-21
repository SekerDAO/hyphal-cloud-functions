import {JSONSchemaType} from "ajv"
import {
	Abi,
	AbiItem,
	AbiEvent,
	AbiFallbackFunction,
	AbiFunction,
	AbiEventInput,
	AbiParam,
	AbiDataType,
	AbiArray,
	AbiScalar
} from "../types/Abi"

export const AbiScalarSchema: JSONSchemaType<AbiScalar> = {
	type: "string"
}

export const AbiArraySchema: JSONSchemaType<AbiArray> = {
	type: "string"
}

export const AbiDataTypeSchema: JSONSchemaType<AbiDataType> = {
	oneOf: [AbiScalarSchema, AbiArraySchema]
}

export const AbiParamSchema: JSONSchemaType<AbiParam> = {
	type: "object",
	properties: {
		internalType: AbiDataTypeSchema,
		type: AbiDataTypeSchema,
		name: {
			type: "string"
		}
	},
	required: ["internalType", "type", "name"]
}

export const AbiEventInputSchema: JSONSchemaType<AbiEventInput> = {
	type: "object",
	properties: {
		internalType: AbiDataTypeSchema,
		type: AbiDataTypeSchema,
		indexed: {
			type: "boolean"
		},
		name: {
			type: "string"
		}
	},
	required: ["internalType", "type", "name", "indexed"]
}

export const AbiFunctionSchema: JSONSchemaType<AbiFunction> = {
	type: "object",
	properties: {
		inputs: {
			type: "array",
			items: AbiParamSchema
		},
		name: {
			type: "string"
		},
		outputs: {
			type: "array",
			items: AbiParamSchema
		},
		stateMutability: {
			type: "string",
			enum: ["nonpayable", "payable", "pure", "view"]
		},
		type: {
			type: "string",
			enum: ["function"]
		}
	},
	required: ["inputs", "name", "outputs", "stateMutability", "type"]
}

export const AbiFallbackFunctionSchema: JSONSchemaType<AbiFallbackFunction> = {
	type: "object",
	properties: {
		state: {
			type: "string",
			enum: ["nonpayable"]
		},
		type: {
			type: "string",
			enum: ["fallback"]
		}
	},
	required: ["state", "type"]
}

export const AbiEventSchema: JSONSchemaType<AbiEvent> = {
	type: "object",
	properties: {
		anonymous: {
			type: "boolean"
		},
		inputs: {
			type: "array",
			items: AbiEventInputSchema
		},
		name: {
			type: "string"
		},
		type: {
			type: "string",
			enum: ["event"]
		}
	},
	required: ["anonymous", "inputs", "name", "type"]
}

export const AbiItemSchema: JSONSchemaType<AbiItem> = {
	type: "object",
	oneOf: [AbiFunctionSchema, AbiEventSchema, AbiFallbackFunctionSchema]
}

export const AbiSchema: JSONSchemaType<Abi> = {
	type: "array",
	items: AbiItemSchema
}
