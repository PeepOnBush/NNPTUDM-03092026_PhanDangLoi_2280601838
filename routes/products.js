var express = require('express');
let slugify = require('slugify')
var router = express.Router();
let modelProduct = require('../schemas/products')
let { checkLogin, checkPermission } = require('../utils/authHandler.js')

/* GET users listing. */
//localhost:3000/api/v1
router.get('/', async function (req, res, next) {
  try {
    let data = await modelProduct.find({});
    let queries = req.query;
    let titleQ = queries.title ? queries.title : '';
    let maxPrice = queries.maxPrice ? queries.maxPrice : 1E4;
    let minPrice = queries.minPrice ? queries.minPrice : 0;
    let limit = queries.limit ? queries.limit : 5;
    let page = queries.page ? queries.page : 1;
    let result = data.filter(
      function (e) {
        return (!e.isDeleted) && e.price >= minPrice
          && e.price <= maxPrice && e.title.toLowerCase().includes(titleQ);
      }
    )
    result = result.splice(limit * (page - 1), limit)
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findById(id)
    if (result && (!result.isDeleted)) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "ID không tồn tại"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID không tồn tại"
    })
  }
})

router.post('/', checkLogin, checkPermission('create', 'product'), async function (req, res, next) {
  try {
    let newObj = new modelProduct({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-', remove: undefined,
        locale: 'vi', trim: true
      }), price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      images: req.body.images
    })
    await newObj.save();
    res.send(newObj)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
})

router.put('/:id', checkLogin, checkPermission('update', 'product'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findByIdAndUpdate(
      id, req.body, {
      new: true
    }
    )
    if (!result) {
      return res.status(404).send({ message: "ID không tồn tại" })
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID không tồn tại"
    })
  }
})

router.delete('/:id', checkLogin, checkPermission('delete', 'product'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await modelProduct.findByIdAndUpdate(
      id, {
        isDeleted: true
      }, {
      new: true
    }
    )
    if (!result) {
      return res.status(404).send({ message: "ID không tồn tại" })
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID không tồn tại"
    })
  }
})

module.exports = router;
