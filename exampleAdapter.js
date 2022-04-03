const Decentralize = require('./')
const Bugout = require('bugout')
const Gun = require('gun')
const SEA = require('gun/sea')
const hyperswarm = require('hyperswarm-web')
const crypto = require('crypto')
const wrtc = require('wrtc')

const topic = 'my cool identifier'
const identifier = crypto.createHash('sha256').update(topic).digest('hex')

let adapters = {
  bugout: {
    stack: function(){
      let b = new Bugout(identifier)
      b.on('message', (address, data) =>{
        d.emit('data', {bugout: {address, data}})
      })
      return b
    }
  },
  gun: {
    stack: function(){
      const gun = new Gun()
      let user = gun.user()
      user.create(topic, identifier, ack => {
        user.auth(topic, identifier)
      })
      gun.on('auth', ack => {
        user.get(topic).on(data => {
          d.emit('data', {gun: {data}})
        })
      })
      return gun
    }
  },
  hyperswarmWeb: {
    stack: function(){
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
      return swarm
    }
  }
}

let d = new Decentralize({identifier, adapters})
let b = d['bugout']
let user = d['gun'].user()
let swarm = d['hyperswarmWeb']

d.route['bugout'] = (data) => b.send(data)
d.route['gun'] = (data) => user.get(identifier).put(data)
swarm.on('connection', (socket, info)=> {
  let last
  d.route['hyperswarmWeb'] = (data) => socket.send(Buffer.from(data))
  
  socket.on('data', data => {
    if(last === data) return
    d.emit('data', {'hyperswarmWeb': {data: data.toString(), when: new Date().getTime()}})
    last = data
  })
})
