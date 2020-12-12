const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')

// Get page model
const Page = require('../models/page')

// Create encodedPareser for validation
const urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
  Get pages index
*/
router.get('/', (req, res) => {
  Page.find({}).sort({sorting: 1}).exec().then((pages)=>{
    res.render('admin/pages', {
        pages:pages
    });
}).catch((err)=>{console.log(err)});
})

/*
  Get add pages
*/
router.get('/add-page', (req, res) => {
  const title = ''
  const content = ''

  res.render('admin/add_page', {
    title: title,
    content: content
  })
})

/*
  post add pages
*/
router.post('/add-pages', urlencodedParser, [
  check('title', 'This title should not be empty')
    .notEmpty(),
  check('content', 'Content should not be empty')
    .notEmpty()
], (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // return res.status(422).jsonp(errors.array())

    const alert = errors.array()
    res.render('admin/add_page', {
      alert
    })
  } else {
    const title = req.body.title
    const content = req.body.content
    Page.findOne({ title: title }, (_err, page) => {
      if (page) {
        req.flash('danger', 'Page title exists chose another')
        res.render('admin/add_page', {
          title: title,
          content: content
        })
      } else {
        const page = new Page({
          title: title,
          content: content,
          sorting: 0
        })
        page.save((err) => {
          if (err) console.log(err)
          req.flash('success', 'Page added')
          res.redirect('/admin/pages')
        })
      }
    })
  }
})

/*
* GET edit page
*/
router.get('/edit-page/:title', (req, res) => {
  Page.findOne({ title: req.params.title }, (err, page) => {
    if (err) {
      return console.log(err)
    } else {
      res.render('admin/edit_page', {
        title: page.title,
        content: page.content,
        id: page._id
      })
    }
  })
})

/*
* POST edit page
*/
router.post('/edit-pages/:title', urlencodedParser, [
  check('title', 'This title should not be empty')
    .exists()
    .isLength({ min: 3 }),
  check('content', 'Content should not be empty')
    .exists()
    .isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // return res.status(422).jsonp(errors.array())

    const alert = errors.array()
    res.render('admin/edit_page', {
      alert
    })
  } else {
    const title = req.body.title
    const content = req.body.content
    const id = req.body.id
    Page.findOne({ title: title, _id: { $ne: id } }, (_err, page) => {
      if (page) {
        req.flash('danger', 'Page title exists chose another')
        res.render('admin/edit_page', {
          title: title,
          content: content,
          id: id
        })
      } else {
        Page.findById(id, (err, page) => {
          if (err) {
            return console.log(err)
          }
          page.title = title
          page.content = content

          page.save((err) => {
            if (err) return console.log(err)
            req.flash('success', 'Page added')
            res.redirect('/admin/pages/edit-page/' + page.title)
          })
        })
      }
    })
  }
})

/*
* GET delete page
*/
router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return console.log(err)
    }
    req.flash('success', 'Page deleted')
    res.redirect('/admin/pages/')
  })
})

module.exports = router
