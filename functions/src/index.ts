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
import removeMyDao from "./endpoints/removeMyDao"
import {config} from "firebase-functions"
import addUsul from "./endpoints/addUsul"

admin.initializeApp({
	serviceAccountId: config().fb.service_account
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
	addStrategyProposal,
	removeMyDao,
	addUsul
}
