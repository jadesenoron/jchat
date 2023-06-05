import express from 'express'
import * as uploadPhotoController from '../controllers/uploadPhotoController'

const router = express.Router()

/* upload photo/s */
router.post('/', uploadPhotoController.uploadPhoto)

export default router