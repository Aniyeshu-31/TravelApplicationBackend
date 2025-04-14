import express from 'express'
import { LoginUser, registerUser } from '../controllers/authController.js';
const router = express.Router();
router.post('/register',registerUser);
router.post('/login',LoginUser);
router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User is authenticated',
    data: req.user, // This depends on your `verifyToken` middleware
  })
})

export default router;