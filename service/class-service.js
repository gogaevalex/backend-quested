const ClassModel = require('../models/class-model');
const TeacherModel = require('../models/teacher-model');
const StudentModel = require('../models/student-model');
const OneStudentLessonModel = require('../models/one-student-lesson-model');
const QuestionModel = require('../models/question-model');
const ApiError = require('../exceptions/api-error');
const addUtils = require('../utils/add-utils');
const checkUtils = require('../utils/check-utils');


class ClassService {
    async create(classId, className) {
        const classCurrent = await ClassModel.findOne({classId});
        if (!classCurrent) {
            const classNew = await ClassModel.create({classId, className});
            return classNew;
        } else {
            return classCurrent;
        }
   }

    async getMyClasses(mongoTeacherId) {
        const teacher = await TeacherModel.findOne({_id: mongoTeacherId});
        if (!teacher) {
            throw ApiError.BadRequest(`Это не правильный mongoTeacherId`)
        }
        const classList = await Promise.all(teacher.mongoClassesIdList.map(async(mongoClassId) => {
            //Filter///////////////============================
            const startFilterList = [];
            const createFilter = (gameType, question) => {
                if (startFilterList.length !== 0) {
                    if (startFilterList[startFilterList.length - 1].gameType === gameType) {
                        let isNewSubject = true;
                        startFilterList[startFilterList.length - 1].subjectList.forEach(({subject, topicList}) => {
                            if (subject === question.subject) {
                                isNewSubject = false;
                                topicList = addUtils.addNewElement(topicList, question.topic);
                            }
                        })
                        if(isNewSubject) {
                            startFilterList[startFilterList.length - 1].subjectList.push({
                                subject: question.subject,
                                topicList: [question.topic]
                            })
                        }
                    }
                } else {
                    startFilterList.push({
                        gameType, 
                        subjectList: [{subject: question.subject, topicList: [question.topic]}]
                    });
                }
            }
            ///////////////////===============================
            const classCurrent = await ClassModel.findOne({_id: mongoClassId});
            const studentList = await Promise.all(classCurrent.mongoStudentIdList.map(async(mongoStudentId) => {
                const studentCurrent = await StudentModel.findOne({_id: mongoStudentId});
                const oneStudentLessonList = await Promise.all(studentCurrent.mongoOneStudentLessons.map(async(oneStudentLessonId) => {
                    const oneStudentLessonCurrent = await OneStudentLessonModel.findOne({_id: oneStudentLessonId});
                    const answerList = await Promise.all(oneStudentLessonCurrent.answer.map(async({correct, timeNeeded, mongoQuestionId}) => {
                        const questionCurrent = await QuestionModel.findOne({_id: mongoQuestionId});
                        createFilter(oneStudentLessonCurrent.gameType, questionCurrent);
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
                    return {gameType: oneStudentLessonCurrent.gameType, gameTime: oneStudentLessonCurrent.gameTime, answer: answerList}
                }));
                return {name: studentCurrent.name, idBracelet: studentCurrent.idBracelet, avatar: studentCurrent.avatar, oneStudentLessonList }
            }))
            return {
                classId: classCurrent.classId, 
                className: classCurrent.className,
                studentList: studentList,
                filter: startFilterList,
                mongoClassId: classCurrent._id,
            };
        }))
        return classList;
    }

    async getOneClass(mongoTeacherId, mongoClassId) {
        const teacher = await TeacherModel.findOne({_id: mongoTeacherId});
        if (!teacher) {
            throw ApiError.BadRequest(`Это не правильный mongoTeacherId`)
        }

        if (checkUtils.checkOneElementUniq(teacher.mongoClassesIdList, mongoClassId)) {
            throw ApiError.BadRequest(`Это не правильный mongoClassId`)
        }
        const classCurrent = await ClassModel.findOne({_id: mongoClassId});
        const studentList = await Promise.all(classCurrent.mongoStudentIdList.map(async(mongoStudentId) => {
            const studentCurrent = await StudentModel.findOne({_id: mongoStudentId});
            const oneStudentLessonList = await Promise.all(studentCurrent.mongoOneStudentLessons.map(async(oneStudentLessonId) => {
                const oneStudentLessonCurrent = await OneStudentLessonModel.findOne({_id: oneStudentLessonId});
                const answerList = await Promise.all(oneStudentLessonCurrent.answer.map(async({correct, timeNeeded, mongoQuestionId}) => {
                    const questionCurrent = await QuestionModel.findOne({_id: mongoQuestionId});
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
                return {gameType: oneStudentLessonCurrent.gameType, gameTime: oneStudentLessonCurrent.gameTime, answer: answerList}
            }));
            return {
                name: studentCurrent.name,
                idBracelet: studentCurrent.idBracelet,
                avatar: studentCurrent.avatar,
                isRegistered: studentCurrent.isRegistered,
                oneStudentLessonList
            }
        }))
        return {
            classId: classCurrent.classId, 
            className: classCurrent.className,
            studentList: studentList,
            mongoClassId: classCurrent._id,
        };

    }
}
module.exports = new ClassService();