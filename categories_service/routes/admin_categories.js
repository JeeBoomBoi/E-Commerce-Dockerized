const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')

// Get category model
const Category = require('../models/category')

// Create encodedPareser for validation
const urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
  Get pages index
*/
router.get('/', (req, res) => {
  Category.find((err, categories) => {
    if (err) {
      return console.log(err)
    }
    res.render('admin/categories', {
      categories: categories
    })
  })
})

/*
  GET add category
*/
router.get('/add-category', (req, res) => {
  const title = ''

  res.render('admin/add_category', {
    title: title
  })
})

/*
  POST add category
*/
router.post('/add-category', urlencodedParser, [
  check('title', 'This title should not be empty')
    .exists()
    .isLength({ min: 3 })
], (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // return res.status(422).jsonp(errors.array())
    const alert = errors.array()
    res.render('admin/add_category', {
      alert
    })
  } else {
    const title = req.body.title
    Category.findOne({ title: title }, (_err, category) => {
      if (category) {
        req.flash('danger', 'Category title exists chose another')
        res.render('admin/add_category', {
          title: title
        })
      } else {
        const category = new Category({
          title: title
        })
        category.save((err) => {
          if (err) console.log(err)
          req.flash('success', 'Category added')
          res.redirect('/admin/categories')
        })
      }
    })
  }
})

/*
* GET edit category
*/
router.get('/edit-categories/:title', (req, res) => {
  Category.findOne({ title: req.params.title }, (err, category) => {
    if (err) {
      return console.log(err)
    } else {
      res.render('admin/edit_category', {
        title: category.title,
        id: category._id
      })
    }
  })
})

/*
* POST edit page
*/
router.post('/edit-categories/:title', urlencodedParser, [
  check('title', 'This title should not be empty')
    .exists()
    .isLength({ min: 3 })
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
    const id = req.body.id
    Category.findOne({ title: title, _id: { $ne: id } }, (_err, category) => {
      if (category) {
        req.flash('danger', 'Category title exists chose another')
        res.render('admin/edit_page', {
          title: title,
          id: id
        })
      } else {
        Category.findById(id, (err, category) => {
          if (err) {
            return console.log(err)
          }
          category.title = title

          category.save((err) => {
            if (err) return console.log(err)
            req.flash('success', 'Page edited')
            res.redirect('/admin/categories')
          })
        })
      }
    })
  }
})

/*
* GET delete page
*/
router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return console.log(err)
    }
    req.flash('success', 'Category deleted')
    res.redirect('/admin/categories/')
  })
})

module.exports = router
