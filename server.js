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

const { DelimiterParser } = require('@serialport/parser-delimiter')
const { SerialPort } = require('serialport')

let serialPort

let raspberry = process.platform === 'linux'
console.log(process.platform)

let openSerialPort = () => {
    serialPort = new SerialPort({
        path: raspberry ? '/dev/ttyACM0' : '/dev/tty.usbmodem1101',
        // path: '/dev/tty.usbmodem1101',
        baudRate: 9600,
        autoOpen: false,
    })
}

openSerialPort()

let serialStatus = ''

let globalX = 0
let globalY = 0


// initAPI(app).then(r => {})

// app.get('/stat', async function (request, response) {
//     response.json(systeminformation)
// })

let a0 = 0
let a1 = 0
let a2 = 0
let a3 = 0

let b4 = 0
let b5 = 0
let b6 = 0
let b7 = 0

let c0 = 0
let c1 = 0
let c2 = 0
let c3 = 0

let outString = ''

let setPosition = (x, y) => {
    a0 = x
    a1 = x
    a2 = x
    a3 = x

    b4 = y
    b5 = y
    b6 = y
    b7 = y

    // outString = a0 + '\t' + a1 + '\t'+ a2 + '\t'+ a3 + '\t'+ b4 + '\t'+ b5 + '\t' + b6 + '\t' + b7 + '\n'
    outString = String.fromCharCode(a0) +
        String.fromCharCode(a1) +
        String.fromCharCode(a2) +
        String.fromCharCode(a3) +
        String.fromCharCode(b4) +
        String.fromCharCode(b5) +
        String.fromCharCode(b6) +
        String.fromCharCode(b7) + '\n'

    console.log(outString)
    serialPort.write(outString)
}


io.on('connection', (socket) => {

    console.log('WEB SOCKET CONNECTED')

    socket.on('message', (data) => {

        let objectData = JSON.parse(data)
         // console.log(objectData)

        // port.write(objectData.x + ',' + objectData.y)
        let x = Math.floor(objectData.x * 100)
        let y = Math.floor(100 - objectData.y * 100)
        globalX = x
        globalY = y

        setPosition(x, y)
        // console.log(x + ' / ' + y)

        // console.log(x)
    })
})

const parser = serialPort.pipe(new DelimiterParser({ delimiter: "\n" }))
parser.on('data', arduinoString => {
    let buf = Buffer.from(arduinoString, "hex")
    let data = buf.toString("utf8")
    console.log(data.replace('�', '').trim().split('\t'))
})


// serialPort.on('data', (arduinoString) => {
//
//     console.log(arduinoString) // HEX STRING
//     let buf = Buffer.from(arduinoString, "hex");
//     let data = buf.toString("utf8");
//     console.warn(data)
//     let dataInt = parseInt(arduinoString)
//     console.warn(dataInt)
//
//     // if (data > 0 && data < 1) {
//     //     let x = data
//     //     console.log(x)
//     // } else {
//     //     // console.error('Error: ' + data)
//     //     // console.error(Math.floor(data))
//     //     let x = data - Math.floor(data)
//     //     if (x > 0 && x < 1)
//     //         console.log(x)
//     // }
// })

let timerFPS = setInterval(async () => {

    // console.log('SERVER FPS')
    // serialPort.write(globalX + '\n')

}, 30)

let timer = setInterval(async () => {

    // We broadcast our state once a sec here, for debug info
    io.emit('state', JSON.stringify({
        system: await systeminformation.system(),
        cpu: await systeminformation.cpu(),
        battery: await systeminformation.battery(),
        load: await systeminformation.currentLoad(),
        time: await systeminformation.time(),

        //'CH340 ' - arduino
        usb: await systeminformation.usb(),
        serial: serialStatus,
    }))

}, 1000)

app.use('/', express.static('dist'))

// app.get('/stat', async function (request, response) {
//     response.json(systeminformation)
// })

server.listen(process.env.PORT || 8000, () => {
    console.log('SERVER UP')
})

serialPort.open(function (err) {

    if (err) {
        return console.log('Error opening port: ', err.message)
    }

    // Because there's no callback to write, write errors will be emitted on the port:
    // port.write('180')
})

// The open event is always emitted
serialPort.on('open', function() {
    console.log('SERIAL PORT OPENED')
    serialStatus = 'open'
    // open logic
    clearInterval(reconnectInterval)
})

serialPort.on('close', function(){
    console.log('SERIAL PORT CLOSED')
    reconnect()
    serialStatus = 'close'
})

serialPort.on('error', function (err) {
    console.error('SERIAL PORT ERROR', err)
    reconnect()
    serialStatus = 'error'
})

let reconnectInterval

let reconnect = function () {
    console.log('SERIAL RECONNECT')
    serialStatus = 'reconnect'
    reconnectInterval = setInterval(function() {
        console.log('SERIAL RECONNECTING...')
        try {
            serialPort.open(function (err) {})
        } catch (e) {}
    }, 2000)
}

process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}`);
});