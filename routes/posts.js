import express from 'express';
import { forgotPassword, Login, Register, resetpassword } from '../controllers/control.js';
import authenticate from '../Middleware/Usercheck.js';



const router = express.Router();



router.post('/register',Register);
router.post('/login',Login);
router.post('/forgetpassword',forgotPassword);
router.post('/:userId/:token',resetpassword);



export default router;