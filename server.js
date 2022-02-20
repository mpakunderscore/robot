const systeminformation = require('systeminformation')

require('dotenv').config()

// const robot = require('./core')

let express = require('express')
const router = express.Router({ strict: true })
// const {initAPI} = require("./api")

// let app = express()
// let server = require('http').Server(app)
// server.listen(process.env.PORT || 8080)

const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

// initAPI(app).then(r => {})

app.get('/stat', async function (request, response) {
    response.json(systeminformation)
})

// app.use(function (req, res, next) {
//     if (req.path.substr(-1) == '/' && req.path.length > 1) {
//         let query = req.url.slice(req.path.length)
//         res.redirect(301, req.path.slice(0, -1) + query)
//     } else {
//         next()
//     }
// })

io.on('connection', (socket) => {
    console.log('CONNECTED')
})

let timer = setInterval(async () => {

    io.emit('state', JSON.stringify({
        system: await systeminformation.system(),
        cpu: await systeminformation.cpu(),
        battery: await systeminformation.battery(),
        load: await systeminformation.currentLoad(),
        time: await systeminformation.time(),

        //'CH340 ' - arduino
        usb: await systeminformation.usb()
    }))

    console.log('EMIT')

}, 1000)

app.use('/', express.static('dist'))

server.listen(process.env.PORT || 8000, () => {
    console.log('SERVER UP')
})

// for (let i = 0; i < food.length; i++) {
//     app.use('/' + food[i].name, express.static('dist'))
// }

const { SerialPort } = require('serialport')
const port = new SerialPort({
    path: '/dev/tty-usbserial1',
    baudRate: 9600,
    autoOpen: false,
})

port.open(function (err) {
    if (err) {
        return console.log('Error opening port: ', err.message)
    }

    // Because there's no callback to write, write errors will be emitted on the port:
    port.write('main screen turn on')
})

// The open event is always emitted
port.on('open', function() {
    // open logic
})