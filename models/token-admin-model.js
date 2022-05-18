const {Schema, model} = require('mongoose');

const TokenSchema = new Schema({
    admin: {type: Schema.Types.ObjectId, ref: 'Admin'},
    refreshToken: {type: String, required: true},
})

module.exports = model('TokenAdmin', TokenSchema);
