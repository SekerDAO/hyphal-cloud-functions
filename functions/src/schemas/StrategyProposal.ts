import {JSONSchemaType} from "ajv"
import {PrebuiltTx} from "../types/common"
import {StrategyProposal} from "../types/StrategyProposal"
import {AbiFunctionSchema} from "./Abi"
import ajv from "./"

const PrebuiltTxSchema: JSONSchemaType<PrebuiltTx> = {
	type: "object",
	properties: {
		address: {
			type: "string",
			format: "address"
		},
		contractMethods: {
			type: "array",
			items: AbiFunctionSchema
		},
		selectedMethodIndex: {
			type: "number"
		},
		args: {
			type: "array",
			items: {
				type: ["string"],
				oneOf: ["string", {type: "array", items: "string"}]
			}
		},
		delegateCall: {
			type: "boolean",
			nullable: true
		},
		value: {
			type: "number",
			nullable: true
		}
	},
	required: ["address", "args", "contractMethods", "selectedMethodIndex"]
}

export const StrategyProposalSchema: JSONSchemaType<StrategyProposal> = {
	type: "object",
	properties: {
		id: {
			type: "number"
		},
		gnosisAddress: {
			type: "string",
			format: "address"
		},
		usulAddress: {
			type: "string",
			format: "address"
		},
		userAddress: {
			type: "string",
			format: "address"
		},
		strategyAddress: {
			type: "string",
			format: "address"
		},
		strategyType: {
			type: "string",
			enum: [
				"singleVoting",
				"singleVotingSimpleMembership",
				"linearVoting",
				"linearVotingSimpleMembership",
				"linearVotingSimpleMembershipZodiacExitModule",
				"quadraticVotingSimpleMembership"
			]
		},
		transactions: {
			type: "array",
			items: PrebuiltTxSchema
		},
		title: {
			type: "string"
		},
		type: {
			type: "string",
			enum: ["generalEvm", "deployUsul", "addStrategies"]
		},
		description: {
			type: "string",
			nullable: true
		},
		newUsulAddress: {
			type: "string",
			nullable: true,
			format: "address"
		},
		sideNetSafeAddress: {
			type: "string",
			nullable: true,
			format: "address"
		},
		bridgeAddress: {
			type: "string",
			nullable: true,
			format: "address"
		},
		sideChain: {
			type: "boolean",
			nullable: true
		}
	},
	required: [
		"id",
		"gnosisAddress",
		"usulAddress",
		"userAddress",
		"strategyAddress",
		"strategyType",
		"transactions",
		"title",
		"type"
	]
}

export const validateStrategyProposal = ajv.compile(StrategyProposalSchema)
