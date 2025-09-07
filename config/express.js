const express = require('express')
const cors = require('cors')
const path = require('path')
const routers = require('../routes')
const events = require('events')

// raise default listener limit temporarily (avoid ignoring the real cause)
events.EventEmitter.defaultMaxListeners = 20

const app = express()

// parse JSON and urlencoded bodies (must run before route handlers)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Enable Cors
app.use(cors({}))


// Serve public assets first so images/static files aren't intercepted by routers/404
app.use(express.static(path.join(__dirname, '..', 'public')))

//Stablishing  the Router
app.use('/', routers)


module.exports = app