import dbConnect from "./db/dbConnection.js";
import dotenv from 'dotenv'

dotenv.config({
  path: "./.env"
})

dbConnect()