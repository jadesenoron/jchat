import express from 'express'
import * as chatController from '../controllers/chatController'

const router = express.Router()

/* get Chat Ids, search, or Conversations */
router.get('/', chatController.getChatData)

/* send message or photos in chat conversation */
router.post('/', chatController.sendChat)

export default router