const {Schema, model} = require('mongoose');

const QuestionSchema = new Schema({
    subject: {type: String, required: true},
    topic: {type: String, required: true},
    questionId: {type: String, required: true},
    content: {type: String, required: true},
})

module.exports = model('Question', QuestionSchema);
