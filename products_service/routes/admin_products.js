const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')
const mkdirp = require('mkdirp')
const fs = require('fs-extra')

// Get page model
const Product = require('../models/product')

// Get Category model
const Category = require('../models/category')

// Create encodedPareser for validation
const urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
  GET products index
*/
router.get('/', (req, res) => {
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
})

/*
  GET add product
*/
router.get('/add-product', (req, res) => {
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
})

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

/*
  POST add products
*/
router.post('/add-product', urlencodedParser, [
  check('title', 'This title should not be empty')
    .notEmpty()
    .exists(),
  check('desc', 'Description should not be empty')
    .notEmpty()
    .exists(),
  check('price', 'Price must have a decimal value')
    .isDecimal()
], (req, res) => {
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
})

/*
* GET edit product
*/
router.get('/edit-product/:id', (req, res) => {
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
})

/*
* POST edit page
*/
router.post('/edit-product/:id', urlencodedParser, [
  check('title', 'This title should not be empty')
    .notEmpty()
    .exists(),
  check('desc', 'Description should not be empty')
    .notEmpty()
    .exists(),
  check('price', 'Price must have a decimal value')
    .isDecimal()
], (req, res) => {
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
})

/*
 * GET delete product
 */
router.get('/delete-product/:id', (req, res) => {
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
})

module.exports = router
