const studentService = require('../service/student-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

class StudentController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {idBracelet, password} = req.body;
            const studentData = await studentService.registration(idBracelet, password);

            return res.json(studentData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {idBracelet, password} = req.body;
            const studentData = await studentService.login(idBracelet, password);
            return res.json(studentData);
        } catch (e) {
            next(e);
        }
    }

    async getMyProfile(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            console.log('token', token, typeof(token));

            if (!token || token === undefined || token === 'undefined') {
                console.log('tyttttttttttt')
                return res.status(403).json({message: "Пользователь не авторизован ТОКЕН"})
            }
            const {id: mongoStudentId} = tokenService.validateAccessToken(token);
            const student = await studentService.getMyProfile(mongoStudentId);
            return res.json(student);
        } catch (e) {
            next(e);
        }
    }

    async getStudentLessons(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1]

            if (!token || token === undefined || token === 'undefined') {
                console.log('tyttttttttttt')
                return res.status(403).json({message: "Пользователь не авторизован ТОКЕН"})
            }
            const {id: mongoStudentId} = tokenService.validateAccessToken(token);
            const student = await studentService.getStudentLessons(mongoStudentId);
            return res.json(student);
        } catch (e) {
            next(e);
        }
    }

    async getStudentStatisticForStudent(req, res, next) {
        try {
            const {idBracelet, mongoTeacherId} = req.body;
            console.log('req.body', req.body);
            const students = await studentService.getStudentStatisticForStudent(idBracelet, mongoTeacherId);
            return res.json(students);
        } catch (e) {
            next(e);
        }
    }

    async getStudents(req, res, next) {
        try {
            const students = await studentService.getStudentsInCourse();
            return res.json(students);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new StudentController();
