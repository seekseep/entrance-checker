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
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, WIDTH, 128)
      ctx.fillStyle = "black"
      ctx.textAlign = "left"
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText(qrCode.data, 64, 64)
      const img = document.createElement("img")
      img.src = canvas.toDataURL()
      img.setAttribute("class", "w-72 h-auto flex-srhink-0")
      images.append(img)
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
  /** @type {HTMLDivElement} */
  const images = document.querySelector("#images")

  video.setAttribute("width", WIDTH)
  video.setAttribute("height", HEIGHT)
  canvas.setAttribute("width", WIDTH)
  canvas.setAttribute("height", HEIGHT)

  appendLog(logs, "顔認証に必要なデータのダウンロード開始")
  await faceapi.loadSsdMobilenetv1Model('/model')
  appendLog(logs, "顔認証に必要なデータのダウンロード終了")

  try {
    appendLog(logs, "カメラへのアクエス権の取得")
    const stream = await mediaDeveices.getUserMedia(constraints)
    appendLog(logs, "カメラへのアクエス権の取得完了")
    video.srcObject = stream
    appendLog(logs, "監視開始")
    start(canvas, video, logs, images)
  } catch (error) {
    appendLog(logs, error)
    throw error
  }
}

window.addEventListener("load", init)
