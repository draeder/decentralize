const Decentralize = require('./')
const Bugout = require('bugout')
const Gun = require('gun')
const SEA = require('gun/sea')
const crypto = require('crypto')

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
    stack: function() {
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

  }
}

let d = new Decentralize({identifier, adapters})
let b = d['bugout']
let user = d['gun'].user()
d.route['bugout'] = (data) => b.send(data)
d.route['gun'] = (data) => user.get(identifier).put(data, ack => {
  //console.log(ack)
})
