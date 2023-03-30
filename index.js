import Fastify from 'fastify'
import formBody from '@fastify/formbody'
import fastifyStatic from '@fastify/static'
import fastifySession from '@fastify/session'
import fastifyCookie from '@fastify/cookie'
import fastifyIO from 'fastify-socket.io'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { socketHandler } from './controllers/sockets.js'
import { appRoutes } from './controllers/routes.js'

const PORT = process.env.port || 8080
const app = Fastify({
  logger: true
})

dotenv.config()

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB })
  .catch(err => console.error(err))

app.register(formBody)
app.register(fastifyCookie)
app.register(fastifySession, {
  secret: process.env.SESSION_SECRET,
  cookie: { secure: false },
  saveUninitialized: false
})
app.register(fastifyStatic, {
  root: process.cwd() + '/public/'
})
app.register(appRoutes)
app.register(fastifyIO)
app.register(socketHandler)

app.listen({ port: PORT, host: '0.0.0.0' })
