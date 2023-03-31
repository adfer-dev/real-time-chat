import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'
const socket = io()
let currentUsername = ''
let currentRoom = ''
const messageForm = document.getElementById('sendMessageForm')
const messageInput = document.getElementById('messageInput')
const chat = document.getElementById('chat')
const userCount = document.getElementById('userCount')
const addRoomButton = document.getElementById('addRoomButton')
const roomHeader = document.getElementById('room')

// SERVER EVENT LISTENERS
socket.on('connect', async () => {
  await fetch('/login-data', {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    }
  })
    .then(response => { return response.json() })
    .then(user => {
      currentUsername = user.username
      restoreRoomButtons(user.rooms)
    })
    .catch(err => console.error(err))
})

socket.on('joined_room', (data) => {
  roomHeader.innerHTML = data.room.name
  document.getElementById(currentRoom)?.classList.remove('activeRoom')
  if (currentRoom !== data.room.name) {
    restoreRoomMessages(data.room.messages)
    currentRoom = data.room.name
    messageInput.focus()
  }
  if (data.isNew) {
    createRoomButton(data.room.name)
  }
  document.getElementById(data.room.name).classList.add('activeRoom')
})

socket.on('update_userCount', (data) => {
  userCount.innerHTML = data.numUsers
})

socket.on('receive_message', (data) => {
  appendUserMessage(data.username, data.message)
})

socket.on('user_connected', (user) => {
  const connectionMessage = 'user connected: ' + user.username
  appendInfoMessage(connectionMessage, 'userConnect')
})
socket.on('user_disconnected', (disconnectData) => {
  const disconnectionMessage = 'user disconnected: ' + disconnectData.username
  appendInfoMessage(disconnectionMessage, 'userDisconnect')
})

socket.on('left_room', (leftRoomData) => {
  const disconnectionMessage = 'user left the room: ' + leftRoomData.username
  appendInfoMessage(disconnectionMessage, 'userDisconnect')
})

socket.on('deleted_userRoom', (deletedRoomData) => {
  document.getElementById(deletedRoomData.room).remove()

  if (currentRoom === deletedRoomData.room) {
    chat.innerHTML = ''
    roomHeader.innerHTML = 'Chat'
    userCount.innerHTML = ''
    currentRoom = ''
  }
})

// PAGE EVENT LISTENERS
messageForm.addEventListener('submit', (event) => {
  event.preventDefault()
  if (messageInput.value && currentRoom) {
    socket.emit('message', { username: currentUsername, room: currentRoom, message: messageInput.value })
    resetMessageInput()
  }
})

addRoomButton.addEventListener('click', () => {
  const room = prompt('Enter the name of the chat room')
  if (room) {
    swapRoom(room)
  }
})

// Aux functions

function resetMessageInput () {
  messageInput.value = ''
}

/**
 * Appends an information message to the chat element.
 * @param {*} message the message to be displayed on chat element
 * @param {*} className the class name of the element to append
 */
function appendInfoMessage (message, className) {
  const newInfoEntry = document.createElement('p')
  newInfoEntry.className = className
  newInfoEntry.innerHTML = message
  chat.append(newInfoEntry)
}

/**
 * Appends a message to the chat element.
 * @param {*} username the user that sent the message
 * @param {*} message the message
 */
function appendUserMessage (username, message) {
  const newChatEntry = document.createElement('p')
  newChatEntry.innerHTML = '<b>' + username + '</b>: ' + message
  if (username === currentUsername) newChatEntry.className = 'userMessage'
  chat.append(newChatEntry)
}

/**
 * Appends a new button to the savedRooms element, setting a class and listener to it.
 * @param {*} roomName the room that the button redirects to
 */
function createRoomButton (roomName) {
  const buttonContainer = document.createElement('div')
  const roomButton = document.createElement('a')
  const deleteRoom = document.createElement('a')

  buttonContainer.className = 'buttonContainer'
  buttonContainer.id = roomName

  deleteRoom.className = 'deleteRoomButton'

  deleteRoom.addEventListener('click', (event) => {
    socket.emit('delete_userRoom', { room: event.target.parentElement.id, username: currentUsername })
    socket.emit('leave_room', { username: currentUsername, room: currentRoom })
  })

  roomButton.className = 'savedRoomButton'
  roomButton.innerHTML = '<img src="images/roomButton.svg"> <p class="roomButtonText">' + roomName + '</p>'
  roomButton.addEventListener('click', () => {
    swapRoom(roomName)
  })
  document.getElementById('savedRooms').append(buttonContainer)
  buttonContainer.append(roomButton)
  buttonContainer.append(deleteRoom)
}

function swapRoom (newRoom) {
  socket.emit('leave_room', { username: currentUsername, room: currentRoom })
  socket.emit('join_room', { username: currentUsername, room: newRoom })
}

/**
 * Function that get the saved messages of a room and append them in chat element.
 * @param {*} messages an array containing the message objects of the user current room
 */
function restoreRoomMessages (messages) {
  chat.innerHTML = ''
  messages.forEach(storedMessage => {
    appendUserMessage(storedMessage.username, storedMessage.message)
  })
}

function restoreRoomButtons (rooms) {
  rooms.forEach(storedRoom => {
    createRoomButton(storedRoom.name)
  })
}
