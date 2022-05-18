const {Schema, model} = require('mongoose');

const TokenSchema = new Schema({
    teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
    refreshToken: {type: String, required: true},
})

module.exports = model('TokenTeacher', TokenSchema);
