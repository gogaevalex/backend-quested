const LessonModel = require('../models/lesson-model');
const ClassModel = require('../models/class-model');
const TeacherModel = require('../models/teacher-model');
const StudentModel = require('../models/student-model');
const OneStudentLessonModel = require('../models/one-student-lesson-model');
const QuestionModel = require('../models/question-model');

const ApiError = require('../exceptions/api-error');
const teacherService = require('../service/teacher-service');
const classService = require('../service/class-service');
const studentService = require('../service/student-service');
const oneStudentLessonService = require('../service/one-student-lesson-service');
const addUtils = require('../utils/add-utils');
const checkUtils = require('../utils/check-utils');


class LessonService {
    async create(teacherId, classId, className, gameType, gameTime, data) {
        const teacher = await teacherService.create(teacherId);
        const lesson = await LessonModel.create({teacherId, classId, className, gameType, gameTime})

        const classCurrent = await classService.create(classId, className);

        const allStudentList = await Promise.all(data.map(async({idBracelet, name, answer}) => {
            const student = await studentService.create(idBracelet, name);
            const oneStudentLesson = await oneStudentLessonService.create(idBracelet, answer, gameType, gameTime);
    
            student.mongoOneStudentLessons = [...student.mongoOneStudentLessons, oneStudentLesson._id];
            student.mongoClassesIdList = addUtils.addNewElement(student.mongoClassesIdList, classCurrent._id);
            await student.save();

            oneStudentLesson.mongoStudentId = student._id;
            oneStudentLesson.mongoLessonId = lesson._id;
            await oneStudentLesson.save();

            return {studentId: student._id, oneStudentLessonId: oneStudentLesson._id};
        }))

        const studentIdList = [];
        const oneStudentLessonIdList = [];
        allStudentList.forEach(({studentId, oneStudentLessonId}) => {
            studentIdList.push(studentId);
            oneStudentLessonIdList.push(oneStudentLessonId);
        })

        classCurrent.mongoTeacherIdList = addUtils.addNewElement(classCurrent.mongoTeacherIdList, teacher._id);
        classCurrent.teacherIdList = addUtils.addNewElement(classCurrent.teacherIdList, teacherId);
        classCurrent.mongoStudentIdList = addUtils.addNewArray(classCurrent.mongoStudentIdList, studentIdList);
        await classCurrent.save();

        lesson.mongoOneStudentLessonIdList = oneStudentLessonIdList;
        lesson.mongoTeacherId = teacher._id;
        await lesson.save();

        teacher.mongoClassesIdList = addUtils.addNewElement(teacher.mongoClassesIdList, classCurrent._id);
        teacher.mongoLessonIdList = addUtils.addNewElement(teacher.mongoLessonIdList, lesson._id);
        await teacher.save();


        return {classCurrent, teacher, lesson, studentIdList, oneStudentLessonIdList};
    }
    
    async getMyLessons(mongoTeacherId) {
        const teacher = await TeacherModel.findOne({_id: mongoTeacherId});
        if (!teacher) {
            throw ApiError.BadRequest(`Это не правильный mongoTeacherId`)
        }
        const filterList = {
            gameTypeList: [],
            gameTimeList: [],
            classNameList: [],
        }
        const lessonList = await Promise.all(teacher.mongoLessonIdList.map(async(mongoLessonId) => {
            const lessonCurrent = await LessonModel.findOne({_id: mongoLessonId});
            const productiveInfo = {
                numberCorrect: 0,
                allTimeNedded: 0,
                numberQuestion: 0,
            }
            const oneStudentLessonList = await Promise.all(lessonCurrent.mongoOneStudentLessonIdList.map(async(oneStudentLessonId) => {
                const oneStudentLessonCurrent = await OneStudentLessonModel.findOne({_id: oneStudentLessonId});
                const studentCurrent = await StudentModel.findOne({_id: oneStudentLessonCurrent.mongoStudentId});
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
                return {name: studentCurrent.name, idBracelet: studentCurrent.idBracelet, avatar: studentCurrent.avatar, answer: answerList }
            }));
            filterList.gameTimeList = addUtils.addNewElement(filterList.gameTimeList, lessonCurrent.gameTime);
            filterList.gameTypeList = addUtils.addNewElement(filterList.gameTypeList, lessonCurrent.gameType);
            filterList.classNameList = addUtils.addNewElement(filterList.classNameList, lessonCurrent.className);

            return {
                gameType: lessonCurrent.gameType,
                gameTime: lessonCurrent.gameTime,
                classId: lessonCurrent.classId, 
                className: lessonCurrent.className,
                mongoLessonId: lessonCurrent._id,
                oneStudentLessonList: oneStudentLessonList,
                productiveInfo: productiveInfo,
            }
        }))
        return {lessonList: lessonList, filterList: filterList};
    }

    async getOneLesson(mongoTeacherId, mongoLessonId) {
        const teacher = await TeacherModel.findOne({_id: mongoTeacherId});
        if (!teacher) {
            throw ApiError.BadRequest(`Это не правильный mongoTeacherId`)
        }
        if (checkUtils.checkOneElementUniq(teacher.mongoLessonIdList, mongoLessonId)) {
            throw ApiError.BadRequest(`Это не правильный mongoLessonId`)
        }
        const lessonCurrent = await LessonModel.findOne({_id: mongoLessonId});
        const productiveInfo = {
            numberCorrect: 0,
            allTimeNedded: 0,
            numberQuestion: 0,
        }
        const oneStudentLessonList = await Promise.all(lessonCurrent.mongoOneStudentLessonIdList.map(async(oneStudentLessonId) => {
            const oneStudentLessonCurrent = await OneStudentLessonModel.findOne({_id: oneStudentLessonId});
            const studentCurrent = await StudentModel.findOne({_id: oneStudentLessonCurrent.mongoStudentId});
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
            return {name: studentCurrent.name, idBracelet: studentCurrent.idBracelet, avatar: studentCurrent.avatar, answer: answerList }
        }));

        return {
            gameType: lessonCurrent.gameType,
            gameTime: lessonCurrent.gameTime,
            classId: lessonCurrent.classId, 
            className: lessonCurrent.className,
            mongoLessonId: lessonCurrent._id,
            oneStudentLessonList: oneStudentLessonList,
            productiveInfo: productiveInfo,
        }
    }
}

module.exports = new LessonService();
