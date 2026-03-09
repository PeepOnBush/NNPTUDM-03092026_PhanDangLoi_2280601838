let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')
module.exports = {
    checkLogin: async function (req, res, next) {
        try {
            let token
            if (req.cookies.token) {
                token = req.cookies.token
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    res.status(403).send({ message: "Bạn chưa đăng nhập" })
                    return;
                }
                token = token.split(' ')[1];
            }
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send({ message: "Token hết hạn" })
            }
        } catch (error) {
            res.status(403).send({ message: "Token không hợp lệ" })
        }
    },
    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);
                if (!user) {
                    return res.status(404).send({ message: "Người dùng không tồn tại" });
                }
                let currentRole = user.role.name;
                if (requiredRole.includes(currentRole)) {
                    next();
                } else {
                    res.status(403).send({ message: "Bạn không có quyền truy cập" });
                }
            } catch (error) {
                res.status(500).send({ message: "Lỗi kiểm tra quyền" });
            }
        }
    },
    checkPermission: function (action, resource) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);
                if (!user) {
                    return res.status(404).send({ message: "Người dùng không tồn tại" });
                }
                let currentRole = user.role.name;
                
                // Định nghĩa quyền cho từng action
                const permissions = {
                    'product': {
                        'read': ['USER', 'MODERATOR', 'ADMIN'],
                        'create': ['MODERATOR', 'ADMIN'],
                        'update': ['MODERATOR', 'ADMIN'],
                        'delete': ['ADMIN']
                    },
                    'user': {
                        'read': ['ADMIN', 'MODERATOR'],
                        'create': ['ADMIN'],
                        'update': ['ADMIN'],
                        'delete': ['ADMIN']
                    }
                };
                
                if (permissions[resource] && permissions[resource][action]) {
                    if (permissions[resource][action].includes(currentRole)) {
                        next();
                    } else {
                        res.status(403).send({ message: "Bạn không có quyền thực hiện hành động này" });
                    }
                } else {
                    res.status(400).send({ message: "Hành động hoặc tài nguyên không hợp lệ" });
                }
            } catch (error) {
                res.status(500).send({ message: "Lỗi kiểm tra quyền" });
            }
        }
    }
}