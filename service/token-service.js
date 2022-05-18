const jwt = require('jsonwebtoken');
const tokenAdminModel = require('../models/token-admin-model');
const tokenTeacherModel = require('../models/token-teacher-model');


class TokenService {
    generateBothTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '1000h'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '100000h'})
        return {
            accessToken,
            refreshToken
        }
    }

    generateAccessToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET)
        return {
            accessToken,
        }
    }

    validateAccessToken(token) {
        try {
            const data = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return data;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }
    ///Admin/////////////////////
    async saveAdminToken(mongoAdminId, refreshToken) {
        const tokenData = await tokenAdminModel.findOne({admin: mongoAdminId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenAdminModel.create({admin: mongoAdminId, refreshToken})
        return token;
    }

    async removeAdminToken(refreshToken) {
        const tokenData = await tokenAdminModel.deleteOne({refreshToken})
        return tokenData;
    }

    async findAdminToken(refreshToken) {
        const tokenData = await tokenAdminModel.findOne({refreshToken})
        return tokenData;
    }
    ////////////////////////////////////

    ///Teacher/////////////////////////
    async saveTeacherToken(teacherId, refreshToken) {
        const tokenData = await tokenTeacherModel.findOne({teacher: teacherId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenTeacherModel.create({teacher: teacherId, refreshToken})
        return token;
    }

    async removeTeacherToken(refreshToken) {
        const tokenData = await tokenTeacherModel.deleteOne({refreshToken})
        return tokenData;
    }

    async findTeacherToken(refreshToken) {
        const tokenData = await tokenTeacherModel.findOne({refreshToken})
        return tokenData;
    }
    ////////////////////////////////////////
}

module.exports = new TokenService();
