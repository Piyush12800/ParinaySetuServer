const express = require('express')
const router = express.Router()
const {auth, isuser,isAdmin} = require('../middlewares/auth')
const {createProfile, updateProfile,
    deleteProfile,getProfileById, addRecommendedProfile,removeRecommendedProfile,getAllUserDetails,getUserAdditionalDetails, updateRecommendedProfiles
} = require('../controllers/Profile')

router.post('/createProfile', auth, isuser, createProfile)
router.put('/updateProfile', auth, isuser, updateProfile)
router.delete('/deleteProfile', auth, isAdmin, deleteProfile)
router.get('/getProfileById/:id', auth, getProfileById)
router.get("/getUserDetails", auth, getAllUserDetails)
router.post('/addRecommendedProfile', auth, isAdmin, addRecommendedProfile)
router.delete('/removeRecommendation/:id', auth, isAdmin, removeRecommendedProfile)
router.get('/getUserAdditionalDetails', auth,isuser, getUserAdditionalDetails)
router.post('/updateRecommendedProfiles', auth, isAdmin, updateRecommendedProfiles)
module.exports = router

