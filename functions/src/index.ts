import admin from "firebase-admin"
import auth from "./endpoints/auth"
import editDao from "./endpoints/editDao"
import addDaoNft from "./endpoints/addDaoNft"
import addSafeProposalSignatures from "./endpoints/addSafeProposalSignatures"
import deleteDaoNft from "./endpoints/deleteDaoNft"
import addDao from "./endpoints/addDao"
import addSafeProposal from "./endpoints/addSafeProposal"
import addNft from "./endpoints/addNft"
import deleteNft from "./endpoints/deleteNft"
import addMyDao from "./endpoints/addMyDao"
import addMyDomain from "./endpoints/addMyDomain"
import editUser from "./endpoints/editUser"
import addStrategyProposal from "./endpoints/addStrategyProposal"

admin.initializeApp({
	serviceAccountId: "token-walk@appspot.gserviceaccount.com"
})

export {
	auth,
	editDao,
	addDao,
	addDaoNft,
	addSafeProposalSignatures,
	deleteDaoNft,
	addSafeProposal,
	addNft,
	deleteNft,
	addMyDomain,
	addMyDao,
	editUser,
	addStrategyProposal
}
