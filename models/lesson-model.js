const {Schema, model} = require('mongoose');

const LessonSchema = new Schema({
    mongoTeacherId: {type: Schema.Types.ObjectId, ref: 'Teacher'},
    teacherId: {type: String, required: true},
    classId: {type: String, required: true},
    className: {type: String, required: true},
    gameType: {type: String, required: true},
    gameTime: {type: Number, required: true},
    mongoOneStudentLessonIdList: [{type: Schema.Types.ObjectId, ref: 'OneStudentLesson'}],
})

module.exports = model('Lesson', LessonSchema);
