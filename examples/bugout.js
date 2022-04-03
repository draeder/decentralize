const Bugout = require('bugout')
const wrtc = require('wrtc')
const crypto = require('crypto')

let topic = 'my cool identifier'
const identifier = crypto.createHash('sha256').update(topic).digest('hex')

let b = new Bugout(identifier)
b.on('seen', address => {
  console.log('Bugout connected!', address)
  let last
  b.on('message', (address, message) => {
    if(last === message) return
    console.log(message)
  })
  process.stdout.on('data', data => {
    b.send(data.toString().trim())
    last = data.toString().trim()
  })
})