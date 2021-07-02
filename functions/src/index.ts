import admin from "firebase-admin"
import auth from "./auth"
import editDao from "./editDao"
import addDaoNft from "./addDaoNft"

admin.initializeApp({
	serviceAccountId: "token-walk@appspot.gserviceaccount.com"
})

export {auth, editDao, addDaoNft}
