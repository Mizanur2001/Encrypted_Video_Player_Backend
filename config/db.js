const mongoose = require('mongoose')
const dotenv = require('dotenv').config()


const dbURL = process.env.DATABASEURL


exports.Connectdb = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbURL).then(() => {
            console.log("db Connected")
            resolve(true)
        }).catch((error) => {
            console.log(`Unable to connect db -- ${error}`);
            reject(error)
            process.exit(-1)
        })
    })
}