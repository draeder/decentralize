const hyperswarm = require('hyperswarm-web')
const crypto = require('crypto')
const wrtc = require('wrtc')

const topic = 'my cool identifier'

const swarm = hyperswarm({
  id: crypto.randomBytes(32),
  bootstrap: ['wss://quickpeers.herokuapp.com', 'wss://geut-webrtc-signal-v3.herokuapp.com', 'wss://geut-webrtc-signal-v3.glitch.me'],
  simplePeer: {wrtc},
  timeout: 15 * 1000
})

const swarmTopic = crypto.createHash('sha256')
.update(topic)
.digest()
swarm.join(swarmTopic)
swarm.on('connection', (socket, details) => {
  console.log('new connection!', details)
  socket.on('data', data => {
    console.log(data.toString())
  })
  process.stdin.on('data', data => {
    socket.send(data)
  })
})

swarm.on('disconnection', (socket, details) => {
  console.log(details.peer.host, 'disconnected!')
  console.log('now we have', swarm.peers.length, 'peers!')
})