import { leaveRoom, sendMessageToClient, joinRoom, deleteRoomFromUser } from './socketHandlers.js'

export function socketHandler (fastify, opts, done) {
  fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
      socket.on('join_room', joinRoom(fastify, socket))

      socket.on('message', sendMessageToClient(fastify))

      socket.on('leave_room', leaveRoom(fastify, socket))

      socket.on('delete_userRoom', deleteRoomFromUser(socket))
    })
  })

  done()
}
