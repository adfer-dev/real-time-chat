import { model, Schema } from 'mongoose'
import { room } from './room.js'

const user = new Schema({
  name: { type: String, index: true },
  rooms: [room]
})

export const users = model('users', user)
