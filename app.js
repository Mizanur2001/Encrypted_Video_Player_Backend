const app = require('./config/express')
const db = require('./config/db')
const dotenv = require('dotenv').config()


const PORT = process.env.PORT

//Data Base Connection
db.Connectdb()


app.listen(PORT, () => {
    console.log(`Server is Listening on ${PORT}`);
})