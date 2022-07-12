const { copyFileSync, mkdirSync, readdirSync } = require('fs');
const { resolve } = require("path")

const fromDir = resolve(__dirname, "../node_modules/@vladmandic/face-api/model")
const toDir = resolve(__dirname, "../dist/model")

mkdirSync(toDir, { recursive: true })

const files = readdirSync(fromDir)

for (let file of files) {
  const fromFile = resolve(fromDir, file)
  const toFile = resolve(toDir, file)
  copyFileSync(fromFile, toFile)
}

console.log("Done")
