import express from 'express';
import { confirmBooking, createBookingOrder, getAllBookingDetails, getBookingDetails } from '../controllers/bookingController.js';
import {verifyToken, verifyUser,verifyAdmin } from '../Utils/verifyToken.js';
const router= express.Router();

router.post('/', verifyToken,createBookingOrder)
router.get('/:id',verifyUser,getBookingDetails)
router.get('/',verifyAdmin,getAllBookingDetails)
router.post('/verify',verifyToken,confirmBooking)
export default router;