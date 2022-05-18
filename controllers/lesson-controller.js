const lessonService = require('../service/lesson-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class LessonController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {teacherId, classId, className, gameType, gameTime, data} = req.body;
            const isNotEmpty = (element, message) => {
                if(element.length === 0) {
                    return next(ApiError.BadRequest(`Ошибка при валидации ${message}`, errors))
                }
            }
            data.forEach(({idBracelet, name, answer}) => {
                isNotEmpty(idBracelet, 'idBracelet');
                isNotEmpty(name, 'name');
                answer.forEach(({correct, timeNeeded, question}) => {
                    isNotEmpty(correct, 'correct');
                    isNotEmpty(timeNeeded, 'timeNeeded');
                    const {subject, topic, id, content} = question;
                    isNotEmpty(subject, 'subject');
                    isNotEmpty(topic, 'topic');
                    isNotEmpty(id, 'id');
                    isNotEmpty(content, 'content');
                })
            })
            const lessonData = await lessonService.create(teacherId, classId, className, gameType, gameTime, data);

            return res.json(lessonData);
        } catch (e) {
            next(e);
        }
    }
    async getMyLessons(req, res, next) {
        try {
            const {mongoTeacherId} = req.body;
            const lessons = await lessonService.getMyLessons(mongoTeacherId);
            return res.json(lessons);
        } catch (e) {
            next(e);
        }
    }

    async getOneLesson(req, res, next) {
        try {
            const {mongoTeacherId, mongoLessonId} = req.body;
            const lessons = await lessonService.getOneLesson(mongoTeacherId, mongoLessonId);
            return res.json(lessons);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new LessonController();
