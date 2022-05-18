const {Schema, model} = require('mongoose');

const TeacherSchema = new Schema({
    teacherId: {type: String, required: true},
    isRegistered: {type: Boolean, required: true, default: false},
    email: {type: String, required: false},
    password: {type: String, required: false},
    isActivated: {type: Boolean, required: true, default: false},
    activationLink: {type: String},
    name: {type: String, required: false},
    surname: {type: String, required: false},
    avatar: {type: String, required: false},
    country: {type: String, required: false},
    school: {type: String, required: false},
    mongoClassesIdList: [{type: Schema.Types.ObjectId, ref: 'Class'}],
    roles: [{type: String, default: "TEACHER"}],
    mongoLessonIdList: [{type: Schema.Types.ObjectId, ref: 'Lesson'}]
})

module.exports = model('Teacher', TeacherSchema);
