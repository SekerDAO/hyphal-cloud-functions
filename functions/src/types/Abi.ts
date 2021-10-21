export type AbiScalar =
	| `uint${number}`
	| "uint"
	| `int${number}`
	| "int"
	| `fixed${number}x${number}`
	| `ufixed${number}x${number}`
	| "bool"
	| "address"
	| `bytes${number}`
	| "bytes"
	| "string"

export type AbiArray = `${AbiScalar}[]`

export type AbiDataType = AbiArray | AbiScalar

export type AbiParam = {
	internalType: AbiDataType
	type: AbiDataType
	name: string
}

export type AbiEventInput = AbiParam & {
	indexed: boolean
}

export type AbiFunction = {
	inputs: AbiParam[]
	name: string
	outputs: AbiParam[]
	stateMutability: "pure" | "view" | "payable" | "nonpayable"
	type: "function"
}

export type AbiFallbackFunction = {
	state: "nonpayable"
	type: "fallback"
}

export type AbiEvent = {
	anonymous: boolean
	inputs: AbiEventInput[]
	name: string
	type: "event"
}

export type AbiItem = AbiFunction | AbiEvent | AbiFallbackFunction

export type Abi = AbiItem[]
