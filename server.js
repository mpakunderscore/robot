const systeminformation = require('systeminformation')

require('dotenv').config()

let express = require('express')
const router = express.Router({strict: true})

const app = express()
const http = require('http')
const server = http.createServer(app)
const {Server} = require("socket.io")
const io = new Server(server)

// SERIAL

const {DelimiterParser} = require('@serialport/parser-delimiter')
const {SerialPort} = require('serialport')

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

let multiplicator = 120

let serialStatus = false

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

// let positions = [
//     {x: 0.2, y: 1.0},
//     {x: 0.1, y: 0.4},
//     {x: 0, y: 0.3},
//     {x: 0.25, y: 0.3},
//     {x: 0.5, y: 0.3},
//     {x: 0.7, y: 0.4},
//     {x: 0.8, y: 1.0},
//     {x: 0.5, y: 0.9},
// ]

let positions = [
    {x: 0.75, y: 1.0},
    {x: 0.38, y: 0.5},
    {x: 0.26, y: 0.4},
    {x: 0.08, y: 0.35},
    {x: 0.03, y: 0.3},
    {x: 0.0, y: 0.3},
    {x: 0.0, y: 0.11},
    {x: 0.32, y: 0.27},
    //fast
]

let positionsHead = [
    {x: 80, y: 120},
    {x: 50, y: 94},
    {x: 37, y: 80},
    {x: 24, y: 64},
    {x: 12, y: 64},
    {x: 12, y: 42},
    {x: 0, y: 0},
    //fast
    {x: 90, y: 90},
]

let positionsBack = [
    {x: 80, y: 120},
    {x: 60, y: 92},
    {x: 40, y: 80},
    {x: 34, y: 68},
    {x: 22, y: 67},
    {x: 22, y: 80},
    {x: 0, y: 23},
    //fast
    {x: 90, y: 90},
]

let stepTime = 1000

let iteration0 = 0
let iteration1 = 2
let iteration2 = 4
let iteration3 = 6

let stepTimeout
let walk = () => {
    stepTimeout = setInterval(() => {

        if (iteration0 > 7)
            iteration0 = 0

        if (iteration1 > 7)
            iteration1 = 0

        if (iteration2 > 7)
            iteration2 = 0

        if (iteration3 > 7)
            iteration3 = 0

        // if (iteration0 === 7)
        //     iteration0 = 0
        // if (iteration1 === 7)
        //     iteration1 = 0
        // if (iteration2 === 7)
        //     iteration2 = 0
        // if (iteration3 === 7)
        //     iteration3 = 0

        serialWrite(
            Math.floor(positionsHead[iteration1].x), Math.floor(positionsHead[iteration1].y),
            Math.floor(positionsHead[iteration3].x), Math.floor(positionsHead[iteration3].y),
            Math.floor(positionsBack[iteration2].x), Math.floor(positionsBack[iteration2].y),
            Math.floor(positionsBack[iteration0].x), Math.floor(positionsBack[iteration0].y))

        iteration0++
        iteration1++
        iteration2++
        iteration3++

        console.log('STEP')

    }, stepTime)
}

// let positions2 = [
//     {x: 0.0, y: 0.5},
//     {x: 0.0, y: 0.5},
//     {x: 1.0, y: 0.8},
//     {x: 1.0, y: 0.8}
// ]

// let stepTimeout = setInterval(() => {
//
//     if (iteration0 > 3)
//         iteration0 = 0
//
//     serialWrite(
//         Math.floor(positions2[iteration0].x * multiplicator), Math.floor(positions2[iteration0].y * multiplicator),
//         Math.floor(positions2[iteration0].x * multiplicator), Math.floor(positions2[iteration0].y * multiplicator),
//         Math.floor(positions2[iteration0].x * multiplicator), Math.floor(positions2[iteration0].y * multiplicator),
//         Math.floor(positions2[iteration0].x * multiplicator), Math.floor(positions2[iteration0].y * multiplicator))
//
//     iteration0++
//
//
//     console.log('STEP')
//
// }, stepTime)


let setPosition = (x, y) => {
    a0 = x
    a1 = y
    a2 = x
    a3 = y

    b4 = x
    b5 = y
    b6 = x
    b7 = y

    // outString = a0 + '/' + a1 + '/'+ a2 + '/'+ a3 + '/'+ b4 + '/'+ b5 + '/' + b6 + '/' + b7 + '\n'
    serialWrite(a0, a1, a2, a3, b4, b5, b6, b7)
}

let serialWrite = (x0, x1, x2, x3, x4, x5, x6, x7) => {

    // console.log(x0)
    console.log(x0 + '/' + x1 + '/' + x2 + '/' + x3 + '/' + x4 + '/' + x5 + '/' + x6 + '/' + x7)
    outString = String.fromCharCode(x0) +
        String.fromCharCode(x1) +
        String.fromCharCode(x2) +
        String.fromCharCode(x3) +
        String.fromCharCode(x4) +
        String.fromCharCode(x5) +
        String.fromCharCode(x6) +
        String.fromCharCode(x7) + '\n'

    // console.warn(outString)
    serialPort.write(outString)
}


io.on('connection', (socket) => {

    console.log('WEB SOCKET CONNECTED')

    socket.on('button', (data) => {
        let objectData = JSON.parse(data)
        console.log(objectData.id)

        if (objectData.id === 'stand') {
            console.log('stand')
            clearInterval(stepTimeout)
            serialWrite(14, 60, 14, 60, 27, 66, 27, 66)
        }
        if (objectData.id === 'walk') {
            console.log('walk')
            walk()
        }
        if (objectData.id === 'sit') {
            console.log('sit')
            clearInterval(stepTimeout)
            serialWrite(50, 60, 50, 60, 20, 0, 20, 0)
        }
        if (objectData.id === 'leg') {
            console.log('leg')
            clearInterval(stepTimeout)
            serialWrite(120, 30, 30, 60, 20, 20, 20, 20)
        }

    })

    socket.on('sliders', (data) => {
        let objectData = JSON.parse(data)
        console.log(objectData)

        serialWrite(
            Math.floor(objectData.forwardTop), Math.floor(objectData.forwardBottom),
            Math.floor(objectData.forwardTop), Math.floor(objectData.forwardBottom),
            Math.floor(objectData.backTop), Math.floor(objectData.backBottom),
            Math.floor(objectData.backTop), Math.floor(objectData.backBottom))
    })

    socket.on('message', (data) => {

        let objectData = JSON.parse(data)
        console.log(objectData)

        console.log(objectData.x + ' ' + objectData.y)

        // port.write(objectData.x + ',' + objectData.y)
        let x = Math.floor(objectData.x * multiplicator)
        let y = Math.floor(objectData.y * multiplicator)

        console.log(x + ' ' + y)

        globalX = x
        globalY = y

        setPosition(x, y)
        // console.log(x + ' / ' + y)

        // console.log(x)
    })
})

const parser = serialPort.pipe(new DelimiterParser({delimiter: "\n"}))
parser.on('data', arduinoString => {
    let buf = Buffer.from(arduinoString, "hex")
    let data = buf.toString("utf8")
    // console.log(data)
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
serialPort.on('open', function () {
    console.log('SERIAL PORT OPENED')
    serialStatus = 'open'
    // open logic
    clearInterval(reconnectInterval)
})

serialPort.on('close', function () {
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
    reconnectInterval = setInterval(function () {
        console.log('SERIAL RECONNECTING...')
        try {
            serialPort.open(function (err) {
            })
        } catch (e) {
        }
    }, 2000)
}

process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}`);
});