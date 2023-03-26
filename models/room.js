import { model, Schema } from 'mongoose'

const room = new Schema({
  name: String,
  messages: [{
    username: String,
    message: String
  }]
})

const rooms = model('rooms', room)

export { room, rooms }
