import { leaveRoom, sendMessageToClient, joinRoom } from './socketHandlers.js'

export function socketHandler (fastify, opts, done) {
  fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
      socket.on('join_room', joinRoom(fastify, socket))

      socket.on('message', sendMessageToClient(fastify))

      socket.on('leave_room', leaveRoom(fastify, socket))
    })
  })

  done()
}
