const adminService = require('../service/admin-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class AdminController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {adminId, email, password} = req.body;
            const adminData = await adminService.registration(adminId, email, password);
            res.cookie('refreshToken', adminData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(adminData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const adminData = await adminService.login(email, password);
            res.cookie('refreshToken', adminData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(adminData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await adminService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await adminService.activate(activationLink);
            return res.redirect(process.env.ADMIN_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const adminData = await adminService.refresh(refreshToken);
            res.cookie('refreshToken', adminData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(adminData);
        } catch (e) {
            next(e);
        }
    }

    async getAdmins(req, res, next) {
        try {
            const admins = await adminService.getAllAdmins();
            return res.json(admins);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new AdminController();
