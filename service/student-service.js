const StudentModel = require('../models/student-model');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const StudentDto = require('../dtos/student-dto');
const ApiError = require('../exceptions/api-error');
const oneStudentLessonModel = require('../models/one-student-lesson-model');
const ClassModel = require('../models/class-model');
const LessonModel = require('../models/lesson-model');
const QuestionModel = require('../models/question-model');
const addUtils = require('../utils/add-utils');

class StudentService {
    async create(idBracelet, name) {
        const student = await StudentModel.findOne({idBracelet});
        if (!student) {

            let avatar = Math.floor(Math.random() * 15);

            const studentNew = await StudentModel.create({idBracelet, name, avatar: avatar});
            return studentNew;
        } else {
            return student;
        }
   }

    async registration(idBracelet, password) {
        const student = await StudentModel.findOne({idBracelet})
        if (!student) {
            throw ApiError.BadRequest(`неверный id браслета`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        student.password = hashPassword;
        student.isRegistered = true;
        student.roles = ['STUDENT'];
        await student.save()
        const studentDto = new StudentDto(student);
        const tokens = tokenService.generateAccessToken({...studentDto});

        return {...tokens, student: studentDto}
    }

    async login(idBracelet, password) {
        const student = await StudentModel.findOne({idBracelet})
        if (!student) {
            throw ApiError.BadRequest('Пользователь с таким кодом не найден')
        }
        if (!student.isRegistered) {
            throw ApiError.BadRequest('Not registered')
        }
        const isPassEquals = await bcrypt.compare(password, student.password);
        console.log('password', isPassEquals, password, student.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const studentDto = new StudentDto(student);
        const tokens = tokenService.generateAccessToken({...studentDto});

        // await tokenService.saveStudentToken(studentDto.id, tokens.refreshToken);
        return {...tokens, student: studentDto}
    }

    async getMyProfile(mongoStudentId) {
        const student = await StudentModel.findOne({_id: mongoStudentId})
        const studentDto = new StudentDto(student);
        const tokens = tokenService.generateAccessToken({...studentDto});
        return {...tokens, student: studentDto}    
    }

    async getStudentStatisticForStudent(idBracelet, mongoTeacherId) {
        console.log('idBracelet', idBracelet);
        const student = await StudentModel.findOne({idBracelet})
        if (!student) {
            throw ApiError.BadRequest('Пользователь с таким кодом не найден')
        }
        let isCorrectTeacher = false;
        const filterList = {
            gameTypeList: [],
            gameTimeList: [],
            classNameList: [],
        }
        const list = await Promise.all(student.mongoOneStudentLessons.map(async(mongoOneStudentLessonId) => {
            const productiveInfo = {
                numberCorrect: 0,
                allTimeNedded: 0,
                numberQuestion: 0,
            }
            const oneStudentLessonCurrent = await oneStudentLessonModel.findOne({_id: mongoOneStudentLessonId});
            const answerList = await Promise.all(oneStudentLessonCurrent.answer.map(async({correct, timeNeeded, mongoQuestionId}) => {
                const questionCurrent = await QuestionModel.findOne({_id: mongoQuestionId});
                if (correct) productiveInfo.numberCorrect++;
                productiveInfo.allTimeNedded += Number(timeNeeded);
                productiveInfo.numberQuestion++;
                return {
                    correct,
                    timeNeeded,
                    question: {
                        subject: questionCurrent.subject,
                        topic: questionCurrent.topic,
                        questionId: questionCurrent.questionId,
                        content: questionCurrent.content,

                    }
                }
            }));
            const LessonCurrent = await LessonModel.findOne({_id: oneStudentLessonCurrent.mongoLessonId});
            console.log('mongoTeacherId', mongoTeacherId, 'llll', LessonCurrent.mongoTeacherId)
            if (toString(mongoTeacherId) === toString(LessonCurrent.mongoTeacherId)) isCorrectTeacher = true;
            filterList.gameTimeList = addUtils.addNewElement(filterList.gameTimeList, LessonCurrent.gameTime);
            filterList.gameTypeList = addUtils.addNewElement(filterList.gameTypeList, LessonCurrent.gameType);
            filterList.classNameList = addUtils.addNewElement(filterList.classNameList, LessonCurrent.className);
            return {answerList,
                classId: LessonCurrent.classId,
                className: LessonCurrent.className,
                mongoTeacherId: LessonCurrent.mongoTeacherId,
                gameType: oneStudentLessonCurrent.gameType,
                gameTime: oneStudentLessonCurrent.gameTime,
                productiveInfo: productiveInfo,
                mongoLessonId: oneStudentLessonCurrent.mongoLessonId,
            }
        }))
        if (!isCorrectTeacher) {
            throw ApiError.BadRequest('mongoTeacherId не верный')
        }
        return {list: list, name: student.name, idBracelet: student.idBracelet, avatar: student.avatar, filterList};
    }


    async getStudentLessons(mongoStudentId) {
        const student = await StudentModel.findOne({_id: mongoStudentId})
        if (!student) {
            throw ApiError.BadRequest('Пользователь с таким кодом не найден')
        }
        let isCorrectTeacher = false;
        const filterList = {
            gameTypeList: [],
            gameTimeList: [],
            classNameList: [],
        }
        const list = await Promise.all(student.mongoOneStudentLessons.map(async(mongoOneStudentLessonId) => {
            const productiveInfo = {
                numberCorrect: 0,
                allTimeNedded: 0,
                numberQuestion: 0,
            }
            const oneStudentLessonCurrent = await oneStudentLessonModel.findOne({_id: mongoOneStudentLessonId});
            const answerList = await Promise.all(oneStudentLessonCurrent.answer.map(async({correct, timeNeeded, mongoQuestionId}) => {
                const questionCurrent = await QuestionModel.findOne({_id: mongoQuestionId});
                if (correct) productiveInfo.numberCorrect++;
                productiveInfo.allTimeNedded += Number(timeNeeded);
                productiveInfo.numberQuestion++;
                return {
                    correct,
                    timeNeeded,
                    question: {
                        subject: questionCurrent.subject,
                        topic: questionCurrent.topic,
                        questionId: questionCurrent.questionId,
                        content: questionCurrent.content,

                    }
                }
            }));
            const LessonCurrent = await LessonModel.findOne({_id: oneStudentLessonCurrent.mongoLessonId});
            filterList.gameTimeList = addUtils.addNewElement(filterList.gameTimeList, LessonCurrent.gameTime);
            filterList.gameTypeList = addUtils.addNewElement(filterList.gameTypeList, LessonCurrent.gameType);
            filterList.classNameList = addUtils.addNewElement(filterList.classNameList, LessonCurrent.className);
            return {answerList,
                classId: LessonCurrent.classId,
                className: LessonCurrent.className,
                mongoTeacherId: LessonCurrent.mongoTeacherId,
                gameType: oneStudentLessonCurrent.gameType,
                gameTime: oneStudentLessonCurrent.gameTime,
                productiveInfo: productiveInfo,
                mongoLessonId: oneStudentLessonCurrent.mongoLessonId,
            }
        }))

        return {list: list, name: student.name, idBracelet: student.idBracelet, avatar: student.avatar, filterList};
    }
}

module.exports = new StudentService();
