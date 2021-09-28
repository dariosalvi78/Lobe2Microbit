// global variables:

const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const minConf = document.getElementById("minConf")
const evtsRate = document.getElementById("evtsRate")
let connectPortBtn = document.getElementById('connectPortBtn')

const ctx = canvas.getContext("2d")
ctx.font = '50px serif'

// tells if the model has been loaded
let modelLoaded = false

// holder of the last recognised label
let lastlabel = ''

// holder of labels between events
let labelsBuffer = []

// events sending timer id
let evtsTimerId

// serial connection variables
let connected = false
let port, writer

// predicts and draws on Canvas
async function predictAndDraw() {
    // draw current frame from the video element onto the canvas
    ctx.drawImage(video, 0, 0, video.width, video.height)
    if (lastlabel) {
        ctx.fillText(lastlabel, 50, 90)
    }
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (modelLoaded) {
            let result = await classifier.predict(video)
            labelsBuffer.push(result)
            // show the one with highest probability
            for (const label in result) {
                if (result[label] >= minConf.value) {
                    lastlabel = label
                }
            }
        }
    }
    window.requestAnimationFrame(predictAndDraw)
}

// request camera
if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } } // prefer rear-facing camera
    }).then((stream) => {
        video.srcObject = stream
        // 
    }).catch((err) => {
        console.error(err)
        alert (err)
    })
}

// load the model
classifier.load('model/signature.json', 'model/model.json')
.then(() =>{
    console.log('Model loaded')
    modelLoaded = true
}).catch((err) => {
    console.error(err)
    alert('Cannot load model')
})

function sendEvents() {
    if (labelsBuffer.length) {
        // send the average conf interval
        let averaged = labelsBuffer.reduce((prev, curr, currIdx) => {
            let retval = {}
            if (currIdx == 1) {
                for (const label in curr) {
                    retval[label] = (prev[label]/ labelsBuffer.length) + (curr[label] / labelsBuffer.length)
                }
            } else {
                for (const label in curr) {
                    retval[label] = prev[label] + (curr[label] / labelsBuffer.length)
                }
            }
            return retval
        })
        if (connected) {
            for (const label in averaged) {
                if (averaged[label] >= minConf.value) {
                    let line = label + ',' + averaged[label].toFixed(2) + '\n'
                    console.log(line)
                    writer.write(line)
                }
            }
        }
    }
    // clear the array
    labelsBuffer.length = 0
    setTimeout(sendEvents, evtsRate.value)
}



connectPortBtn.addEventListener('click', async () => {
    if (!"serial" in navigator) {
        alert('Your borwser does not support serail ports')
    }
    if (!window.isSecureContext) {
        alert('Not secure context')
    }

    if (connected) {
        try {
            await writer.releaseLock()
        } catch (err) {
            console.error(err)
        }
        try {
            await writer.close()
        } catch (err) {
            console.error(err)
        }
        try {
            await port.close()
        } catch (err) {
            console.error(err)
        }
        connected = false
        connectPortBtn.innerText = "Connect"
    } else {
        try {
            connectPortBtn.disabled = true
            connectPortBtn.innerText = "Connecting..."
            // prompt for which port to use
            port = await navigator.serial.requestPort()
            // open the port
            await port.open({ baudRate: 115200 })
            // pipe a writer to the port
            const textEncoder = new TextEncoderStream()
            textEncoder.readable.pipeTo(port.writable)
            writer = textEncoder.writable.getWriter()

            connected = true
            connectPortBtn.innerText = "Disconnect"
            connectPortBtn.disabled = false
        } catch (err) {
            connected = false
            connectPortBtn.disabled = false
            connectPortBtn.innerText = "Connect"
            console.error(err)
            alert('Could not find/connect to port')
        }
    }
})

// send events over serial
setTimeout(sendEvents, evtsRate.value)

// start prediction
predictAndDraw()