let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        }
        // So sánh mật khẩu
        let isPasswordValid = await bcrypt.compare(password, getUser.password);
        if (!isPasswordValid) {
            return false;
        }
        return getUser;
    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role')
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        let user = await userModel.findById(userId);
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        
        // Kiểm tra mật khẩu cũ
        let isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new Error("Mật khẩu cũ không chính xác");
        }
        
        // Mã hóa mật khẩu mới
        let salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(newPassword, salt);
        
        await user.save();
        return user;
    }
}