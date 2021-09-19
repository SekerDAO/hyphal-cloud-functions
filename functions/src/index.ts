import admin from "firebase-admin"
import auth from "./auth"
import editDao from "./editDao"
import addDaoNft from "./addDaoNft"
import updateDaoUser from "./updateDaoUser"
import addZoraAuction from "./addZoraAuction"
import addSafeProposalSignatures from "./addSafeProposalSignatures"
import deleteDaoNft from "./deleteDaoNft"

admin.initializeApp({
	serviceAccountId: "token-walk@appspot.gserviceaccount.com"
})

export {auth, editDao, addDaoNft, updateDaoUser, addZoraAuction, addSafeProposalSignatures, deleteDaoNft}
