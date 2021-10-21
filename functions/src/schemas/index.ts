import Ajv from "ajv"
import {isAddress} from "@ethersproject/address"

const ajv = new Ajv()
ajv.addFormat("address", {
	type: "string",
	validate: (address: string) => isAddress(address)
})

export default ajv
