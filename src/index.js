import io from 'socket.io-client'

import styles from './index.module.css'
// import systeminformation from "systeminformation";

const port = 8000
const ip = 'localhost:' + port

// let socket = io(ip, {secure: false})
let socket = io(window.location.hostname + ':' + port, {
    secure: false,
    timeout: 2000
})
// let socket = io(window.location.hostname, {secure: true})

socket.connect()

let timer

let robotStatus = {arduino: false, serial: false, timeout: 0}

let lastState = {time: {current: 0}}

window.onload = function() {

    let app = document.getElementById('app')

    app.onclick = (event) => {
        let x = event.clientX / window.visualViewport.width
        let y = event.clientY / window.visualViewport.height

        console.log(event)

        socket.emit('message', JSON.stringify({x, y}))
    }

    app.ontouchmove = (event) => {
        console.log(event)
        let x = event.touches[0].clientX / window.visualViewport.width
        let y = event.touches[0].clientY / window.visualViewport.height

        socket.emit('message', JSON.stringify({x, y}))
    }

    let timerTimeout = setInterval(() => {

        let timeout = new Date().getTime() - lastState.time.current
        if (timeout > 3000)
            app.style.background = '#e17705'

        robotStatus.timeout = timeout
        app.innerText = printStatus(robotStatus)

    }, 1000)

    socket.on('connect', () => {

        const engine = socket.io.engine
        console.log(engine.transport.name) // in most cases, prints 'polling'

        app.style.background = '#08f26e'

        engine.once('upgrade', () => {
            // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
            console.log(engine.transport.name) // in most cases, prints 'websocket'
        })
        engine.on('packet', ({ type, data }) => {
            // called for each packet received
        })
        engine.on('packetCreate', ({ type, data }) => {
            // called for each packet sent
        })
        engine.on('drain', () => {
            // called when the write buffer is drained
        })
        engine.on('close', (reason) => {
            console.log('CLOSE')
            app.style.background = '#e70101'
            // called when the underlying connection is closed
        })
    })

    socket.on('state', (data) => {
        app.style.background = '#08f26e'
        let state = JSON.parse(data)
        lastState = state
        console.log(state)

        // console.log(state.usb.find(usb => usb.name.startsWith('CH340')))
        let arduino = state.usb.length > 0 && !!state.usb.find(usb => usb.name.startsWith('CH340') || usb.manufacturer.includes('Arduino'))
        robotStatus.arduino = arduino
        robotStatus.serial = state.serial
        app.innerText = printStatus(robotStatus)
    })

    let printStatus = (robotStatus) => {
        return 'Arduino: ' + robotStatus.arduino + '\n' + 'Serial: ' + (robotStatus.serial) + '\n' + 'Timeout: ' + (robotStatus.timeout / 1000)
    }

    socket.on('disconnect', () => {
        console.log('DISCONNECT')
        app.style.background = '#e70101'
        timer = setTimeout(() => {
            socket.connect()
        }, 1000)
    })

    socket.on('timeout', () => {
        console.log('TIMEOUT')
        app.style.background = '#e7c304'
        timer = setTimeout(() => {
            socket.connect()
        }, 1000)
    })

    socket.on('connect_error', () => {
        console.log('ERROR')
        app.style.background = '#e17705'
        timer = setTimeout(() => {
            socket.connect()
        }, 1000)
    })
}