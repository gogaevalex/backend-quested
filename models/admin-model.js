const {Schema, model} = require('mongoose');

const AdminSchema = new Schema({
    adminId: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, required: true, default: false},
    roles: [{type: String, default: "ADMIN"}],
})

module.exports = model('Admin', AdminSchema);
