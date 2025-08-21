const express = require("express")
const path = require("path")
const app = express()

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
