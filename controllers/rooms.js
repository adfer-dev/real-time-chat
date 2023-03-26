import mongoose from 'mongoose'
import { rooms } from '../models/room.js'
import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env' })

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB })
  .catch(err => console.error(err))

async function findRoomByName (roomName) {
  const room = await rooms.findOne({ name: roomName }).exec()
  return room
}

async function roomExists (roomName) {
  return await findRoomByName(roomName) !== null
}

async function createRoom (roomName) {
  if (!(await roomExists(roomName))) {
    await rooms.create({
      name: roomName,
      messages: []
    })
  }
}

async function deleteRoom (room) {
  await rooms.deleteOne({ _id: room._id })
}
/**
 * Adds a message to the list of messages of the room
 * @param {*} roomName the name of the room
 * @param {Object} message an object containing the username of the sender and the message
 */
async function addMessageToRoom (roomName, message) {
  await findRoomByName(roomName)
    .then(async (selectedRoom) => {
      selectedRoom.messages.push(message)
      await selectedRoom.save()
    })
}

export { findRoomByName, createRoom, deleteRoom, addMessageToRoom, roomExists }
