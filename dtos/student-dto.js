module.exports = class StudentDto {
    id;
    roles;
    name;
    avatar;
    constructor(model) {
        this.id = model._id;
        this.roles = model.roles;
        this.name = model.name;
        this.avatar = model.avatar;
    }
}
