import {InfuraProvider} from "@ethersproject/providers"
import {config} from "firebase-functions"

const provider = new InfuraProvider(config().infura.network, {
	projectId: config().infura.id,
	projectSecret: config().infura.secret
})

export default provider
