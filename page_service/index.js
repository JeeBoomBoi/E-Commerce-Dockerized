const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const fileUpload = require('express-fileupload')

// Make mongoose use find one and update
mongoose.set('useFindAndModify', false)

// Connect to Database
mongoose.connect('mongodb+srv://jeethendra:qwerty@123@cluster0.4g8up.mongodb.net/E-Commerce?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'), { useNewUrlParser: true })
db.once('open', () => {
  console.log('Connected to the database')
})

// Init App
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Set global errors variable
app.locals.errors = null

// Express fileupload middleware
app.use(fileUpload())

// Body-Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// express-session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// Express messages
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})
// Adding routes
const pages = require('./routes/pages.js')
const adminPages = require('./routes/admin_pages.js')

app.use('/admin/pages', adminPages)
app.use('/', pages)

app.listen(3000, () => {
  console.log('Server running at port 3000')
})

module.exports = app
