import {JSONSchemaType} from "ajv"
import ajv from "./"
import {SafeProposal, SafeSignature, SafeProposalState} from "../types/SafeProposal"
import {AbiItemSchema} from "./Abi"

export const SignatureSchema: JSONSchemaType<SafeSignature> = {
	type: "object",
	properties: {
		signer: {
			type: "string"
		},
		data: {
			type: "string"
		}
	},
	required: ["signer", "data"]
}

export const SafeProposalSchema: JSONSchemaType<SafeProposal> = {
	type: "object",
	properties: {
		gnosisAddress: {
			type: "string",
			format: "address"
		},
		title: {
			type: "string"
		},
		state: {
			type: "string",
			enum: ["active", "canceled", "executed", "passed", "failed", "queued", "waiting"]
		},
		type: {
			type: "string",
			enum: ["changeRole", "createAuction", "cancelAuction", "generalEVM", "decentralizeDAO"]
		},
		userAddress: {
			type: "string",
			format: "address"
		},
		id: {
			type: "integer",
			nullable: true
		},
		description: {
			type: "string",
			nullable: true
		},
		amount: {
			type: "number",
			nullable: true
		},
		recipientAddress: {
			type: "string",
			nullable: true,
			format: "address"
		},
		newRole: {
			type: "string",
			enum: ["admin", "kick"],
			nullable: true
		},
		balance: {
			type: "number",
			nullable: true
		},
		newThreshold: {
			type: "number",
			nullable: true
		},
		signatures: {
			type: "array",
			items: SignatureSchema
		},
		signaturesStep2: {
			type: "array",
			nullable: true,
			items: SignatureSchema
		},
		auctionId: {
			type: "number",
			nullable: true
		},
		nftId: {
			type: "number",
			nullable: true
		},
		nftAddress: {
			type: "string",
			format: "address",
			nullable: true
		},
		duration: {
			type: "number",
			nullable: true
		},
		reservePrice: {
			type: "number",
			nullable: true
		},
		curatorAddress: {
			type: "string",
			format: "address",
			nullable: true
		},
		curatorFeePercentage: {
			type: "number",
			nullable: true
		},
		auctionCurrencySymbol: {
			type: "string",
			nullable: true
		},
		auctionCurrencyAddress: {
			type: "string",
			format: "address",
			nullable: true
		},
		contractAddress: {
			type: "string",
			format: "address",
			nullable: true
		},
		contractAbi: {
			type: "array",
			items: AbiItemSchema,
			nullable: true
		},
		contractMethod: {
			type: "string",
			nullable: true
		},
		callArgs: {
			type: "object",
			nullable: true,
			required: []
		},
		daoVotingThreshold: {
			type: "number",
			nullable: true
		},
		gracePeriod: {
			type: "number",
			nullable: true
		}
	},
	required: ["gnosisAddress", "title", "state", "userAddress", "type", "signatures"]
}

export const SafeProposalSignatureSchema: JSONSchemaType<{
	proposalId: string
	signature: SafeSignature
	signatureStep2: SafeSignature
	newState?: SafeProposalState
}> = {
	type: "object",
	properties: {
		proposalId: {
			type: "string"
		},
		signature: SignatureSchema,
		signatureStep2: SignatureSchema,
		newState: {
			type: "string",
			enum: ["active", "canceled", "executed", "passed", "failed", "queued", "waiting"],
			nullable: true
		}
	},
	required: ["proposalId", "signature", "signatureStep2"]
}

export const validateSafeProposal = ajv.compile(SafeProposalSchema)
export const validateSafeProposalSignature = ajv.compile(SafeProposalSignatureSchema)
