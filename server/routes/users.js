import express from 'express'
import * as userController from '../controllers/userController'

const router = express.Router()


/* login user */
router.post('/login', userController.loginUser)

/* signup user */
router.post('/', userController.signupUser)

/* GET user by query */
router.get('/', userController.getUserByQuery)

/* update user */
router.put('/:userid', userController.updateUser)

/* update user password */
router.put('/:userid/newpassword', userController.updateUserPassword)

/* verify user password */
router.post('/:userid/verifypassword', userController.verifyPassword)

/* update online status */
router.put('/:userid/updateonlinestatus', userController.updateOnlineStatus)

/* delete user account */
router.delete('/:userid', userController.deleteUserAccount)

export default router
