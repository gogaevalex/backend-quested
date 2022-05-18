const TeacherModel = require('../models/teacher-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const TeacherDto = require('../dtos/teacher-dto');
const ApiError = require('../exceptions/api-error');

class TeacherService {
    async create(teacherId) {
        const teacher = await TeacherModel.findOne({teacherId});
        if (!teacher) {
            let avatar = Math.floor(Math.random() * 15);
            const teacherNew = await TeacherModel.create({teacherId, avatar: avatar});
            return teacherNew;
        } else {
            return teacher;
        }
   }

    async registration(teacherId, email, password, name, surname) {
        const teacher = await TeacherModel.findOne({teacherId});
        if (!teacher) {
            throw ApiError.BadRequest(`Пользователь с id не существует`)
        }
        if (teacher.isRegistered) {
            throw ApiError.BadRequest(`Пользователь уже зарегестрирован`)
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf
        teacher.isRegistered = true;
        teacher.email = email;
        teacher.name = name;
        teacher.surname = surname;
        teacher.password = hashPassword;
        teacher.activationLink = activationLink;
        teacher.roles = ['TEACHER'];
        await teacher.save();

        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/teacher/${activationLink}`);

        const teacherDto = new TeacherDto(teacher); // id, email, isActivated, roles
        const tokens = tokenService.generateBothTokens({...teacherDto});
        await tokenService.saveTeacherToken(teacherDto.id, tokens.refreshToken);

        return {...tokens, teacher: teacherDto}
    }

    async activate(activationLink) {
        const teacher = await TeacherModel.findOne({activationLink})
        if (!teacher) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        teacher.isActivated = true;
        await teacher.save();
    }

    async login(email, password) {
        const teacher = await TeacherModel.findOne({email})
        if (!teacher) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, teacher.password);
        console.log('password teacger', isPassEquals, password, teacher.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const teacherDto = new TeacherDto(teacher);
        const tokens = tokenService.generateBothTokens({...teacherDto});

        await tokenService.saveTeacherToken(teacherDto.id, tokens.refreshToken);
        return {...tokens, teacher: teacherDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeTeacherToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const teacherData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findTeacherToken(refreshToken);
        if (!teacherData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const teacher = await TeacherModel.findById(teacherData.id);
        const teacherDto = new TeacherDto(teacher);
        const tokens = tokenService.generateBothTokens({...teacherDto});

        await tokenService.saveTeacherToken(teacherDto.id, tokens.refreshToken);
        return {...tokens, teacher: teacherDto}
    }

    async getAllTeachers() {
        const teachers = await TeacherModel.find();
        return teachers;
    }
    
    async updateProfileTeacher(mongoTeacherId, name, surname) {
        const teacher = await TeacherModel.findById(mongoTeacherId);
        if (!teacher) {
            throw ApiError.BadRequest(`Пользователь с id не существует`)
        }
        teacher.name = name;
        teacher.surname = surname;
        await teacher.save();
        const teacherDto = new TeacherDto(teacher);
        const tokens = tokenService.generateBothTokens({...teacherDto});
        await tokenService.saveTeacherToken(teacherDto.id, tokens.refreshToken);
        return {...tokens, teacher: teacherDto}
    }
}

module.exports = new TeacherService();