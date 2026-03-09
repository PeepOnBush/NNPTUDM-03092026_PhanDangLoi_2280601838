var express = require("express");
var router = express.Router();
let { postUserValidator, validateResult } = require('../utils/validatorHandler')
let userController = require('../controllers/users')

let { checkLogin, checkRole } = require('../utils/authHandler.js')

let userModel = require("../schemas/users");

router.get("/", checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let users = await userModel
      .find({ isDeleted: false })
      .populate({
        'path': 'role',
        'select': "name"
      })
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
});

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    let result = await userModel
      .find({ _id: req.params.id, isDeleted: false })
    if (result.length > 0) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID không tồn tại" });
  }
});

router.post("/", checkLogin, checkRole("ADMIN"), postUserValidator, validateResult,
  async function (req, res, next) {
    try {
      let newItem = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.role
      )
      let saved = await userModel
        .findById(newItem._id)
      res.send(saved);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findById(id);
    if (!updatedItem) {
      return res.status(404).send({ message: "ID không tồn tại" });
    }
    for (const key of Object.keys(req.body)) {
      updatedItem[key] = req.body[key];
    }
    await updatedItem.save();

    let populated = await userModel
      .findById(updatedItem._id)
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "ID không tồn tại" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;