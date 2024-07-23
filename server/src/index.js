import app from "./app.js";
import dbConnect from "./db/dbConnection.js";
import dotenv from 'dotenv'

dotenv.config({
  path: "./.env"
})

dbConnect()
.then(() => {
  const portNo = process.env.PORT || 8000
  app.listen(portNo, () => {
    console.log(`Server is running on : ${portNo}`)
  })
})
.catch((err) => {
  console.log("MongoDB connect error : ", err)
  process.exit(1)
})