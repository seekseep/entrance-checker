import jsQR from "jsqr";
import * as faceapi from '@vladmandic/face-api';

const WIDTH = 1024
const HEIGHT = 720

window.stop = false

const mediaDeveices = window.navigator.mediaDevices

const constraints = {
  audio: false,
  video: {
    width: WIDTH,
    height: HEIGHT
  }
}

/**
 *
 * @param {HTMLDivElement} logs
 * @param {any} message
 */
function appendLog (logs, message) {
  const log = document.createElement("p")
  log.style.fontSize = "11px"
  log.style.margin = "5px 0"
  log.innerHTML = message
  logs.prepend(log)
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLVideoElement} video
 * @param {HTMLDivElement} logs
 * @param {Number} interval
 */
function start (canvas, video, logs, interval = 100) {
  const ctx = canvas.getContext('2d')

  async function draw () {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)

    const qrCode = jsQR(imageData.data, WIDTH, HEIGHT)
    const detections = await faceapi.detectAllFaces(canvas)

    detections.forEach(
      /**
       *
       * @param {import("@vladmandic/face-api").FaceDetection} detection
       */
      (detection) => {
        const box = detection.box
        ctx.strokeStyle = "red"
        ctx.lineWidth = 4
        ctx.strokeRect(
          box.x,
          box.y,
          box.width,
          box.height
        )
      }
    )

    const existsQRCode = !!qrCode
    const existsFace = detections.length > 0

    if (existsQRCode && existsFace) {
      // appendLog(logs, new Date().toLocaleTimeString() + ": QR & 顔コードあり")
      // appendLog(logs, qrCode.data)
      const img = document.createElement("img")
      img.src = canvas.toDataURL()
      document.body.append(img)
      window.alert("認証しました。")
    } else if (existsQRCode) {
      // appendLog(logs, new Date().toLocaleTimeString() + ": QRコードあり")
      // appendLog(logs, qrCode.data)
    } else if (existsFace) {
      // appendLog(logs, new Date().toLocaleTimeString() + ": 顔あり")
    }

    if (window.stop) return

    setTimeout(draw, interval)
  }

  draw()
}

async function init () {
  /** @type {HTMLVideoElement} */
  const video = document.querySelector("#video")
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas")
  /** @type {HTMLDivElement} */
  const logs = document.querySelector("#logs")

  video.setAttribute("width", WIDTH)
  video.setAttribute("height", HEIGHT)
  video.setAttribute("hidden", "")
  canvas.setAttribute("width", WIDTH)
  canvas.setAttribute("height", HEIGHT)

  await faceapi.loadSsdMobilenetv1Model('/model')

  try {
    const stream = await mediaDeveices.getUserMedia(constraints)
    video.srcObject = stream
    start(canvas, video, logs)
  } catch (error) {
    appendLog(logs, error)
    throw error
  }
}

window.addEventListener("load", init)
