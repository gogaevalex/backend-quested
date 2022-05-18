const {Schema, model} = require('mongoose');

const ClassSchema = new Schema({
    mongoTeacherIdList: [{type: Schema.Types.ObjectId, ref: 'Teacher'}],
    teacherIdList: [{type: String, required: false}],
    classId: {type: String, required: true},
    className: {type: String, required: true},
    mongoStudentIdList: [{type: Schema.Types.ObjectId, ref: 'Student'}]
})

module.exports = model('Class', ClassSchema);
