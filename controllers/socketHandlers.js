import { findRoomByName, addMessageToRoom, createRoom } from './rooms.js'
import { addRoomToUser, findUserRoom, deleteUserRoom } from './users.js'

function joinRoom (fastify, socket) {
  return async (roomData) => {
    const { username, room } = roomData
    socket.join(room)
    socket.to(room).emit('user_connected', { username })

    await createRoom(room)
    const currentRoom = await findRoomByName(room)
    const isNew = !(await findUserRoom(username, currentRoom._id))
    fastify.io.in(room).emit('joined_room', { room: currentRoom, isNew })
    await addRoomToUser(username, currentRoom)
    fastify.io.in(room).emit('update_userCount', { numUsers: fastify.io.sockets.adapter.rooms.get(room)?.size })

    socket.on('disconnecting', () => {
      socket.to(room).emit('update_userCount', { numUsers: fastify.io.sockets.adapter.rooms.get(room)?.size - 1 }) // this needs be handling on disconnecting because on disconnect the room set is empty
    })

    socket.on('disconnect', () => {
      socket.to(room).emit('user_disconnected', { username })
    })
  }
}

function sendMessageToClient (fastify) {
  return async (messageData) => {
    const newMessage = {
      username: messageData.username,
      message: messageData.message
    }
    await addMessageToRoom(messageData.room, newMessage)

    fastify.io.in(messageData.room).emit('receive_message', newMessage)
  }
}

function leaveRoom (fastify, socket) {
  return (leaveData) => {
    if (leaveData.room) {
      socket.leave(leaveData.room)
      socket.to(leaveData.room).emit('left_room', { username: leaveData.username })
      fastify.io.in(leaveData.room).emit('update_userCount', { numUsers: fastify.io.sockets.adapter.rooms.get(leaveData.room)?.size })
    }
  }
}

function deleteRoomFromUser (socket) {
  return async (deleteRoomData) => {
    const selectedRoom = await findRoomByName(deleteRoomData.room)
    deleteUserRoom(deleteRoomData.username, selectedRoom)
    socket.emit('deleted_userRoom', { room: selectedRoom.name })
  }
}

export { leaveRoom, sendMessageToClient, joinRoom, deleteRoomFromUser }
