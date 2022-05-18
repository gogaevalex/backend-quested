const teacherService = require('../service/teacher-service');
const tokenService = require('../service/token-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class TeacherController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {teacherId, email, password, name, surname} = req.body;
            const teacherData = await teacherService.registration(teacherId, email, password, name, surname);
            res.cookie('refreshToken', teacherData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(teacherData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const teacherData = await teacherService.login(email, password);
            res.cookie('refreshToken', teacherData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(teacherData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await teacherService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await teacherService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const teacherData = await teacherService.refresh(refreshToken);
            res.cookie('refreshToken', teacherData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(teacherData);
        } catch (e) {
            next(e);
        }
    }

    async getTeachers(req, res, next) {
        try {
            const teachers = await teacherService.getAllTeachers();
            return res.json(teachers);
        } catch (e) {
            next(e);
        }
    }

    async updateProfileTeacher(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({message: "Пользователь не авторизован ТОКЕН"})
            }
            const {id: mongoTeacherId} = tokenService.validateAccessToken(token);
            const {name, surname} = req.body;
            const teacherData = await teacherService.updateProfileTeacher(mongoTeacherId, name, surname);
            res.cookie('refreshToken', teacherData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(teacherData);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new TeacherController();
