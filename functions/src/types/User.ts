import {SignatureLike} from "@ethersproject/bytes"

export type Domain = {
	name: string
	symbol: string
	address: string
}

export type Auth = {
	account: string
	token: string
	signature: SignatureLike
}

export type User = {
	name?: string
	url?: string
	bio?: string
	location?: string
	email?: string
	website?: string
	twitter?: string
	instagram?: string
	profileImage?: string
	headerImage?: string
}
