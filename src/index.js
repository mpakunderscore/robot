import io from 'socket.io-client'

import styles from './index.module.css'

const port = 8000
const ip = 'localhost:' + port

let socket = io(ip, {secure: false})
// let socket = io(window.location.hostname, {secure: true})

socket.connect()

let timer

window.onload = function() {

    let app = document.getElementById('app')

    socket.on('connect', () => {

        const engine = socket.io.engine
        console.log(engine.transport.name) // in most cases, prints 'polling'

        app.style.background = 'green'

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
            app.style.background = 'red'
            // called when the underlying connection is closed
        })
    })

    socket.on('state', (data) => {
        app.style.background = 'green'
        console.log(JSON.parse(data))
    })

    socket.on('disconnect', () => {
        console.log('DISCONNECT')
        app.style.background = 'red'
        timer = setTimeout(() => {
            socket.connect()
        }, 1000)
    })

    socket.on('connect_error', () => {
        console.log('ERROR')
        app.style.background = 'yellow'
        timer = setTimeout(() => {
            socket.connect()
        }, 1000)
    })
}