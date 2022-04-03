const crypto = require('crypto')
const Gun = require('gun')
const SEA = require('gun/sea')

const topic = 'my cool identifier'
const identifier = crypto.createHash('sha256').update(topic).digest('hex')

let gun = new Gun()

let user = gun.user()
user.create(topic, identifier, ack => {
  console.log(ack)
  user.auth(topic, identifier)
})
gun.on('auth', ack => {
  console.log('Authenticated!')
  let last
  user.get(identifier).on(data => {
    if(last === data) return
    console.log(data)
  })
  process.stdout.on('data', data => {
    last = data.toString().trim()
    user.get(topic).put(data.toString().trim())
  })
})
