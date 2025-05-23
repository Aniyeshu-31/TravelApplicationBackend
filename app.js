import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import tourRoute from './routes/tours.js'
import authRoute from './routes/auth.js'
import UserRoute from './routes/user.js'
import ReviewRoute from './routes/reviews.js'
import BookingRoute from './routes/booking.js'
dotenv.config()
const app = express()
// database connection
const corsOptions = {
  origin: 'https://travel-booking-application-ten.vercel.app',
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
}
app.use(cors(corsOptions))
// Allow frontend at localhost:3000
// middleware
// middleware
app.use(express.json())
app.use(cookieParser())
mongoose.set('strictQuery', false)
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDb database Connected')
  } catch (err) {
    console.log('MongoDb Database Connection Failed')
  }
}
// app.use(cors(corsOption))
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/tours', tourRoute)
app.use('/api/v1/users', UserRoute)
app.use('/api/v1/review', ReviewRoute)
app.use('/api/v1/booking', BookingRoute)
const port = process.env.PORT || 8000
app.listen(port, () => {
  connect();
  console.log(`Server is Listening on port ${port}`)
})
