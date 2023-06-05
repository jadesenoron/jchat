/* eslint-disable no-console */
import path from 'path'
import express from 'express'
import fileUpload from 'express-fileupload'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import logger from 'morgan'
import mongoose from 'mongoose'
import * as routes from './routes'

const app = express()
// database setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jchat'
const mongooseConfigs = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(mongoUri, mongooseConfigs)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use(compression())

app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 }, // limit to 20MB
  useTempFiles : true, // use temporary file storage instead of memory RAM
}))

app.use(express.static(path.join(__dirname, "..", "frontend", "build")))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(path.join(__dirname, "..", "public")))

app.use('/api/users', routes.users)
app.use('/api/uploadphoto', routes.uploadphoto)
app.use('/api/chat', routes.chat)

app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"))
})

// handle errors
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({error: err})
})

module.exports = app
