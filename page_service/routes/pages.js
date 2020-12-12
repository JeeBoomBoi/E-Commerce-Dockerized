const express = require('express')
const router = express.Router()
const request = require('request')

const APIURL = 'http://localhost:3001/admin/categories'
// const APIURL1 = 'http://localhost:3002/admin/products'

router.get('/', (req, res) => {
  return res.render('index', { title: 'Home' })
})

router.get('/admin/categories', (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
      res.render('admin/categories')
    } else {
      console.log('error')
      res.send('error')
    }
  })
})
module.exports = router
