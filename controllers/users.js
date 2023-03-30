import { users } from '../models/user.js'

async function findUserByName (username) {
  const user = await users.findOne({ name: username }).exec()
  return user
}

async function userExists (username) {
  return await findUserByName(username) !== null
}

async function createUser (username) {
  if (!(await userExists(username))) {
    await users.create({
      name: username,
      rooms: []
    })
  }
}

/**
 * Adds a room to the list of rooms of the user
 * @param {*} username the name of the user
 * @param {Object} room an object containing the room to be added to the rooms array
 */
async function addRoomToUser (username, room) {
  const selectedUser = await findUserByName(username)
  if (!(await findUserRoom(username, room._id))) {
    selectedUser.rooms.push(room)
    await selectedUser.save()
  }
}

async function deleteUserRoom (username, room) {
  const selectedUser = await findUserByName(username)
  selectedUser.rooms.remove(room)
  await selectedUser.save()
}

async function findUserRoom (username, roomId) {
  const user = await findUserByName(username)
  return user.rooms.find(room => room._id.equals(roomId))
}

export { findUserByName, createUser, addRoomToUser, userExists, findUserRoom, deleteUserRoom }
