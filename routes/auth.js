var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler.js')

/* GET home page. */
//localhost:3000
router.post('/register', async function (req, res, next) {
    try {
        let newUser = await userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            "69a5462f086d74c9e772b804"
        )
        res.send({
            message: "Đăng ký thành công"
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
});

router.post('/login', async function (req, res, next) {
    try {
        let result = await userController.QueryByUserNameAndPassword(
            req.body.username, req.body.password
        )
        if (result) {
            let token = jwt.sign({
                id: result.id
            }, 'secret', {
                expiresIn: '1h'
            })
            res.cookie("token", token, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true
            });
            res.send({ token: token, message: "Đăng nhập thành công" })
        } else {
            res.status(404).send({ message: "Sai thông tin đăng nhập" })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
});

router.get('/me', checkLogin, async function (req, res, next) {
    try {
        let getUser = await userController.FindUserById(req.userId);
        res.send(getUser);
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

router.post('/logout', checkLogin, function (req, res, next) {
    res.cookie('token', null, {
        maxAge: 0,
        httpOnly: true
    })
    res.send({ message: "Đã đăng xuất" })
})

router.post('/change-password', checkLogin, async function (req, res, next) {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).send({ message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới" });
        }
        
        if (oldPassword === newPassword) {
            return res.status(400).send({ message: "Mật khẩu mới phải khác mật khẩu cũ" });
        }
        
        let updatedUser = await userController.ChangePassword(req.userId, oldPassword, newPassword);
        res.send({ message: "Đổi mật khẩu thành công", user: updatedUser });
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = router;
