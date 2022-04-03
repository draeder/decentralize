const EventEmitter = require('events').EventEmitter

const Decentralize = function(params){
  const decentralize = this
  const events = new EventEmitter()
  decentralize.emit = events.emit.bind(events)
  decentralize.on = events.on.bind(events)
  decentralize.once = events.once.bind(events)
  decentralize.off = events.off.bind(events)
  decentralize.route = {}

  for(let adapter in params.adapters){
    if(typeof params.adapters[adapter].stack === 'function'){
      decentralize[adapter] = params.adapters[adapter].stack()
    }
  }

  let last
  decentralize.on('data', data => {
    if(last === data) return
    let type = Object.keys(data)[0]
    for(let adapter in params.adapters){
      if(type !== adapter && Object.keys(params.adapters[adapter]).length > 0){
        decentralize.route[adapter](data[type].data)
      }
    }
    last = data
  })
}
module.exports = Decentralize