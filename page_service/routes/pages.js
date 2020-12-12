const express = require('express')
const router = express.Router()
const request = require('request')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const { check, validationResult } = require('express-validator')
const fs = require('fs-extra')
const mkdirp = require('mkdirp')

const Category = require('../models/category')
const Product = require('../models/product')

function isImage (files) {
  if (files !== null) {
    const extension = files.image.name.split('.').pop()
    console.log(extension)
    switch (extension) {
      case 'jpg':
        return true
      case 'jpeg':
        return true

      case 'png':
        return true

      default:
        return false
    }
  } else return false
}

const APIURL = 'http://localhost:3001/admin/categories'
const APIURL1 = 'http://localhost:3002/admin/products'

router.get('/', (req, res) => {
  return res.render('index', { title: 'Home' })
})

router.get('/admin/categories', (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
      Category.find((err, categories) => {
        if (err) {
          return console.log(err)
        }
        res.render('admin/categories', {
          categories: categories
        })
      })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/categories/add-category', (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
      res.render('admin/add_category')
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.post('/admin/categories/add-category', urlencodedParser, [
  check('title', 'This title should not be empty')
    .exists()
    .isLength({ min: 3 })
], (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
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
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/categories/delete-category/:id', (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
      Category.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          return console.log(err)
        }
        req.flash('success', 'Category deleted')
        res.redirect('/admin/categories/')
      })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/categories/edit-categories/:title', (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
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
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.post('/admin/categories/edit-categories/:title', urlencodedParser, [
  check('title', 'This title should not be empty')
    .exists()
    .isLength({ min: 3 })
], (req, res, next) => {
  request(APIURL, (err, response) => {
    if (!err && response.statusCode == 200) {
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
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/products', (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      let count = 0
      Product.count((err, c) => {
        if (err) {
          return console.log(err)
        }
        count = c
      })
      Product.find().then((products) => {
        res.render('admin/products', {
          products: products,
          count: count
        })
      }).catch((err) => { console.log(err) })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/products/add-product', (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      const title = ''
      const desc = ''
      const price = ''

      Category.find().then((categories) => {
        res.render('admin/add_product', {
          title: title,
          desc: desc,
          price: price,
          categories: categories
        })
      }).catch((err) => { console.log(err) })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.post('/admin/products/add-product', urlencodedParser, [
  check('title', 'This title should not be empty')
    .notEmpty()
    .exists(),
  check('desc', 'Description should not be empty')
    .notEmpty()
    .exists(),
  check('price', 'Price must have a decimal value')
    .isDecimal()
], (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      const title = req.body.title
      const desc = req.body.desc
      const price = req.body.price
      const category = req.body.category
      const errors = validationResult(req)
      let imageFile
      if (!req.files) {
        imageFile = ''
      }
      if (req.files) {
        imageFile = typeof (req.files.image) !== 'undefined' ? req.files.image.name : ''
      }
      if (!isImage(req.files)) {
        errors.errors.push({ value: '', msg: 'You must upload an image', param: 'image', location: 'body' })
      }
      if (!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        return Category.find().then((categories) => {
          res.render('admin/add_product', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            categories: categories
          })
        }).catch((err) => { console.log(err) })
      }
      Product.findOne({ title: title }).then((product) => {
        if (product) {
          req.flash('danger', 'product exists, choose another name')
          Category.find().then((categories) => {
            res.render('admin/add_product', {
              title: title,
              desc: desc,
              price: price,
              categories: categories
            })
          })
        } else {
          const mprice = parseFloat(price).toFixed(2)

          const product = new Product({
            title: title,
            desc: desc,
            price: mprice,
            category: category,
            image: imageFile
          })

          product.save((err) => {
            if (err) {
              console.log(err)
            }

            mkdirp('public/images/product_imgs/' + product._id)
              .then(() => {
                mkdirp('public/images/product_imgs/' + product._id + '/gallery')
                  .then(() => {
                    mkdirp('public/images/product_imgs/' + product._id + 'gallery/thumbs')
                      .then(() => {
                        if (imageFile !== '') {
                          const productImage = req.files.image
                          const path = 'public/images/product_imgs/' + product._id + '/' + imageFile

                          productImage.mv(path, (err) => {
                            if (err) {
                              return res.status(500).send(err)
                            }
                            req.flash('success', 'product added')
                            res.redirect('/admin/products')
                          })
                        } else {
                          req.flash('success', 'product added with default image')
                          res.redirect('/admin/products')
                        }
                      })
                  })
              })
          })
        }
      }).catch((err) => { console.log(err) })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/products/edit-product/:id', (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      let errors

      if (req.session.errors) errors = req.session.errors
      req.session.errors = null

      Category.find().then((categories) => {
        Product.findById(req.params.id).then((p) => {
          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            const galleryDir = 'public/images/product_imgs/' + p._id + '/gallery'
            let galleryImages = null

            fs.readdir(galleryDir).then((_err, files) => {
              galleryImages = files
              res.render('admin/edit_product', {
                title: p.title,
                errors: errors,
                desc: p.desc,
                price: parseFloat(p.price).toFixed(2),
                categories: categories,
                image: p.image,
                galleryImages: galleryImages,
                id: p._id
              })
            })
          }
        })
      }).catch((err) => { console.log(err) })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/products/edit-product/:id', urlencodedParser, [
  check('title', 'This title should not be empty')
    .notEmpty()
    .exists(),
  check('desc', 'Description should not be empty')
    .notEmpty()
    .exists(),
  check('price', 'Price must have a decimal value')
    .isDecimal()
], (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      const title = req.body.title
      const desc = req.body.desc
      const price = req.body.price
      const category = req.body.category
      const errors = validationResult(req)
      const id = req.params.id
      const pimage = req.body.pimage
      let imageFile
      if (!req.files) {
        imageFile = ''
      }
      if (req.files) {
        imageFile = typeof (req.files.image) !== 'undefined' ? req.files.image.name : ''
      }
      if (!isImage(req.files)) {
        errors.errors.push({ value: '', msg: 'You must upload an image', param: 'image', location: 'body' })
      }
      if (!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        return Category.find().then((categories) => {
          res.render('admin/edit_product', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            categories: categories
          })
        }).catch((err) => { console.log(err) })
      }
      Product.findOne({ title: title, _id: { $ne: id } }).then((product) => {
        if (product) {
          req.flash('danger', 'product exists, choose another name')
          Category.find().then((categories) => {
            res.render('admin/edit_product', {
              title: title,
              desc: desc,
              price: price,
              categories: categories
            })
          })
        } else {
          Product.findById(id).then((p) => {
            p.title = title
            p.desc = desc
            p.price = parseFloat(price).toFixed(2)
            p.category = category
            if (imageFile === '') {
              p.image = pimage
            } else {
              p.image = imageFile
            }
            p.save((err) => {
              if (err) {
                return console.log(err)
              }

              if (imageFile !== '') {
                if (pimage !== '') {
                  fs.remove('public/images/product_imgs/' + id + '/' + pimage).then(() => {
                    const productImage = req.files.image
                    const path = 'public/images/product_imgs/' + id + '/' + imageFile

                    productImage.mv(path, (err) => {
                      if (err) return res.status(500).send(err)

                      req.flash('success', 'product Edited')
                      return res.redirect('/admin/products')
                    })
                  }
                  ).catch((err) => { console.log(err) })
                } else {
                  const productImage = req.files.image
                  const path = 'public/images/product_imgs/' + id + '/' + imageFile

                  productImage.mv(path, (err) => {
                    if (err) return res.status(500).send(err)

                    req.flash('success', 'product Edited, No previous image found')
                    return res.redirect('/admin/products')
                  })
                }
              } else {
                req.flash('success', 'product Edited Without a new image')
                res.redirect('/admin/products')
              }
            })
          })
        }
      }).catch((err) => { console.log(err) })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})

router.get('/admin/products/delete-product/:id', (req, res, next) => {
  request(APIURL1, (err, response) => {
    if (!err && response.statusCode == 200) {
      const id = req.params.id
      const path = 'public/images/product_imgs/' + id

      fs.remove(path, function (err) {
        if (err) {
          console.log(err)
        } else {
          Product.findByIdAndRemove(id, function (err) {
            console.log(err)
          })

          req.flash('success', 'Product deleted!')
          res.redirect('/admin/products')
        }
      })
    } else {
      console.log('error')
      res.send('error')
    }
  })
})


module.exports = router
