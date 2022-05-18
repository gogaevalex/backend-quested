const OneStudentLessonModel = require('../models/one-student-lesson-model');
const QuestionModel = require('../models/question-model');


class OneStudentLessonService {
    async create(idBracelet, answer, gameType, gameTime) {
        const answerForDb = await Promise.all(answer.map(async({correct, timeNeeded, question}) => {
                
            const questionNew = await QuestionModel.create({subject: question.subject, topic: question.topic, questionId: question.id, content: question.content})
            return {correct: correct, timeNeeded: timeNeeded, mongoQuestionId: questionNew._id}
        }))

    
        const oneStudentLesson = await OneStudentLessonModel.create({idBracelet, answer: answerForDb, gameType, gameTime});

        return oneStudentLesson;
   }
}

module.exports = new OneStudentLessonService();