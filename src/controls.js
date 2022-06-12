import styles from './index.module.css'
import {socket} from "./index"

let sliders = {
    forwardBottom: 45,
    forwardTop: 45,
    backBottom: 45,
    backTop: 45,
}

let generateSliders = () => {

    let controls = document.getElementById('controls')
    controls.classList.add(styles.controls)

    // controls.append(generateInput(styles.forwardBottom, 'forwardBottom'))
    // controls.append(generateInput(styles.forwardTop, 'forwardTop'))
    // controls.append(generateInput(styles.backBottom, 'backBottom'))
    // controls.append(generateInput(styles.backTop, 'backTop'))
}

let generateInput = (id, name) => {
    let input = document.createElement("input")
    input.setAttribute('type', 'range')
    input.setAttribute('min', '0')
    input.setAttribute('max', '120')
    input.setAttribute('value', '45')
    // input.name = name
    input.classList.add(styles.slider)
    input.classList.add(id)
    input.setAttribute('id', name)
    input.onchange = () => sliderMove(input)
    return input
}

let sliderMove = (input) => {
    // console.log(input)
    sliders[input.id] = Number(input.value)
    socket.emit('sliders', JSON.stringify(sliders))
    // console.log(sliders)
}

export {generateSliders}