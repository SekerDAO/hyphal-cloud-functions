import {JSONSchemaType} from "ajv"
import ajv from "./"
import {Domain, Auth, User} from "../types/User"

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

export const AuthSchema: JSONSchemaType<Auth> = {
	type: "object",
	properties: {
		account: {
			type: "string",
			format: "address"
		},
		token: {
			type: "string"
		},
		signature: {
			type: "object",
			required: []
		}
	},
	required: ["account", "token", "signature"]
}

export const UserSchema: JSONSchemaType<User> = {
	type: "object",
	properties: {
		name: {type: "string", nullable: true},
		url: {type: "string", nullable: true},
		bio: {type: "string", nullable: true},
		location: {type: "string", nullable: true},
		email: {type: "string", nullable: true},
		website: {type: "string", nullable: true},
		twitter: {type: "string", nullable: true},
		instagram: {type: "string", nullable: true},
		profileImage: {type: "string", nullable: true},
		headerImage: {type: "string", nullable: true}
	},
	required: []
}

export const validateDomain = ajv.compile(DomainSchema)
export const validateAuth = ajv.compile(AuthSchema)
export const validateUser = ajv.compile(UserSchema)
