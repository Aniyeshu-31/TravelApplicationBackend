import Booking from '../models/booking.js' // Ensure this path is correct
import dotenv from 'dotenv'
import crypto, { sign } from 'crypto'
import Razorpay from 'razorpay'
import { nanoid } from 'nanoid'
dotenv.config()
export const createBookingOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body
    console.log(totalAmount)
    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid totalAmount provided!',
      })
    }

    const keyId = process.env.RZP_PAY_ID
    const keySecret = process.env.RZP_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error(
        '❌ Razorpay credentials are missing in environment variables'
      )
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Razorpay credentials not set',
      })
    }
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${nanoid(12)}`,
    }

    const order = await instance.orders.create(options)

    if (!order) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
      })
    }
    console.log(order)
    return res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (err) {
    console.error('🔥 createBookingOrder ERROR:', err)

    return res.status(500).json({
      success: false,
      message: 'Order creation failed',
      error: err.message || err,
    })
  }
}

export const confirmBooking = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingDetails } = req.body

    if (!paymentId || !signature) {
      console.warn('⚠️ Missing paymentId or signature')
      return res.status(400).json({
        success: false,
        message: 'Missing payment details',
      })
    }

    console.log('💰 AmountToPay:', bookingDetails.AmountToPay)
    const hmac = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET)
    hmac.update(`${orderId}|${paymentId}`)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== signature) {
      console.warn('⚠️ Invalid Razorpay Signature')
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      })
    }

    console.log('📦 Booking Details:', bookingDetails)
    const existingBooking = await Booking.findOne({ orderId })
    if (existingBooking) {
      console.warn('⚠️ Booking already exists for this orderId:', orderId)
      return res.status(409).json({
        success: false,
        message: 'Booking already confirmed for this order.',
      })
    }

    const booking = new Booking({
      userId: bookingDetails.userId,
      userEmail: bookingDetails.userEmail,
      tourName: bookingDetails.tourName,
      fullName: bookingDetails.fullName,
      phone: bookingDetails.phone,
      guestSize: bookingDetails.guestSize,
      totalAmount: bookingDetails.AmountToPay,
      bookAt: bookingDetails.bookAt || new Date(),
      razorpayPaymentId: paymentId,
      orderId: orderId,
      status: 'confirmed',
    })

    const savedBooking = await booking.save()

    console.log('✅ Booking confirmed and saved:', savedBooking._id)

    res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      data: savedBooking,
    })
  } catch (err) {
    console.error('❌ Booking Confirmation Error:', err)
    res.status(500).json({
      success: false,
      message: 'Booking confirmation failed',
      error: err.message,
    })
  }
}

export const getBookingDetails = async (req, res) => {
  const id = req.params.id
  try {
    const book = await Booking.findById(id)
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not Found!' })
    }
    res.status(200).json({
      success: true,
      message: 'Booking Fetched Successfully!!',
      data: book,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    })
  }
}

export const getAllBookingDetails = async (req, res) => {
  try {
    const bookings = await Booking.find()
    res.status(200).json({
      success: true,
      message: 'All Bookings Fetched Successfully!!',
      data: bookings,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    })
  }
}
