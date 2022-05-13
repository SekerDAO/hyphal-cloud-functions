export type UsulDeployType = "usulSingle" | "usulMulti"

export type Usul = {
	usulAddress: string
	deployType: UsulDeployType
	bridgeAddress?: string
	sideNetSafeAddress?: string
}
