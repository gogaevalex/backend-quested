const {Schema, model} = require('mongoose');

const OneStudentLessonSchema = new Schema({
    mongoStudentId: {type: Schema.Types.ObjectId, ref: 'Student'},
    mongoLessonId: {type: Schema.Types.ObjectId, ref: 'Lesson'},
    idBracelet: {type: String, required: true},
    gameType: {type: String, required: true},
    gameTime: {type: Number, required: true},
    answer: [{
        correct: {type: Boolean, required: true},
        timeNeeded: {type: String, required: true},
        mongoQuestionId: {type: Schema.Types.ObjectId, ref: 'Question'}
    }]

})

module.exports = model('OneStudentLesson', OneStudentLessonSchema);
