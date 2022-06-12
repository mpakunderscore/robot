const PiCamera = require('pi-camera');
const camera = new PiCamera({
    mode: 'photo',
    output: `./image.jpg`,
    width: 640,
    height: 480,
    nopreview: true,
});

camera.snap()
    .then((result) => {
        // Your picture was captured
        console.log('image')
    })
    .catch((error) => {
        // Handle your error
        console.log(error)
    });