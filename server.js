const systeminformation = require('systeminformation')

require('dotenv').config()

let express = require('express')
const router = express.Router({ strict: true })

const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

// SERIAL

const { SerialPort } = require('serialport')
let port = new SerialPort({
    path: '/dev/tty.usbserial-110',
    baudRate: 9600,
    autoOpen: false,
})


// initAPI(app).then(r => {})

app.get('/stat', async function (request, response) {
    response.json(systeminformation)
})


io.on('connection', (socket) => {

    console.log('WEB SOCKET CONNECTED')

    socket.on('message', (data) => {

        let objectData = JSON.parse(data)
         console.log(objectData)

        // port.write(objectData.x + ',' + objectData.y)
        let x = Math.floor(objectData.x * 180)
        console.log(x)
        port.write(x + ' ')
    })
})

port.on('data', (arduinoString) => {
    // console.log(arduinoString) // HEX STRING
    let data = parseInt(arduinoString)
    console.log(data)
    // if (data > 0 && data < 1) {
    //     let x = data
    //     console.log(x)
    // } else {
    //     // console.error('Error: ' + data)
    //     // console.error(Math.floor(data))
    //     let x = data - Math.floor(data)
    //     if (x > 0 && x < 1)
    //         console.log(x)
    // }

})

let timer = setInterval(async () => {

    // We broadcast our state once a sec here, for debug info
    io.emit('state', JSON.stringify({
        system: await systeminformation.system(),
        cpu: await systeminformation.cpu(),
        battery: await systeminformation.battery(),
        load: await systeminformation.currentLoad(),
        time: await systeminformation.time(),

        //'CH340 ' - arduino
        usb: await systeminformation.usb()
    }))

}, 1000)

app.use('/', express.static('dist'))

app.get('/stat', async function (request, response) {
    response.json(systeminformation)
})

server.listen(process.env.PORT || 8000, () => {
    console.log('SERVER UP')
})

port.open(function (err) {

    if (err) {
        return console.log('Error opening port: ', err.message)
    }

    // Because there's no callback to write, write errors will be emitted on the port:
    // port.write('180')
})

// The open event is always emitted
port.on('open', function() {
    console.log('SERIAL PORT OPENED')
    // open logic
})

port.on('close', function(){
    console.log('SERIAL PORT CLOSED')
    reconnect()
})

port.on('error', function (err) {
    console.error('SERIAL PORT ERROR', err)
    reconnect()
})

let reconnect = function () {
    console.log('SERIAL RECONNECT')
    setTimeout(function() {
        console.log('SERIAL RECONNECTING')
        // port = new SerialPort({
        //     path: '/dev/tty.usbserial-110',
        //     baudRate: 9600,
        //     autoOpen: false,
        // })
    }, 2000)
}