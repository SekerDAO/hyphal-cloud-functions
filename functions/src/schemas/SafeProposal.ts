import {JSONSchemaType} from "ajv"
import ajv from "./"
import {SafeProposal} from "../types/SafeProposal"

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
			enum: ["active", "canceled", "executed", "passed", "failed", "queued", "waiting"]
		},
		type: {
			enum: ["changeRole", "createAuction", "cancelAuction", "generalEVM", "decentralizeDAO"]
		},
		userAddress: {
			type: "string",
			format: "address"
		},
		id: {
			type: "string",
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
			type: "array"
		},
		signaturesStep2: {
			type: "array",
			nullable: true
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
			nullable: true
		},
		contractMethod: {
			type: "string",
			nullable: true
		},
		callArgs: {
			type: "object",
			nullable: true
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

export const validateSafeProposal = ajv.compile(SafeProposalSchema)
