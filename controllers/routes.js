import { createUser, findUserByName } from './users.js'

export function appRoutes (fastify, opts, done) {
  fastify.get('/', (req, res) => {
    res.sendFile('login.html', { root: './public' })
  })

  fastify.get('/chat', (req, res) => {
    if (req.session.user) {
      res.sendFile('chat.html', { root: './public' })
    } else {
      res.redirect('/')
    }
  })

  fastify.get('/login-data', (req, res) => {
    res.send({ username: req.session.user.username, rooms: req.session.user.rooms })
  })

  fastify.post('/user-login', async (req, res) => {
    const username = req.body.username
    await createUser(username)
    const user = await findUserByName(username)
    req.session.user = { username, rooms: user.rooms }
    res.redirect('/chat')
  })

  done()
}
