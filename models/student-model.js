const {Schema, model} = require('mongoose');

const StudentSchema = new Schema({
    idBracelet: {type: String, unique: true, required: true},
    isRegistered: {type: Boolean, required: true, default: false},
    password: {type: String, required: false},
    name: {type: String, required: false},
    surname: {type: String, required: false},
    avatar: {type: String, required: false},
    country: {type: String, required: false},
    school: {type: String, required: false},
    roles: [{type: String, default: "STUDENT"}],
    mongoOneStudentLessons: [{type: Schema.Types.ObjectId, ref: 'OneStudentLesson'}],
    mongoClassesIdList: [{type: Schema.Types.ObjectId, ref: 'Class'}],
})

module.exports = model('Student', StudentSchema);
