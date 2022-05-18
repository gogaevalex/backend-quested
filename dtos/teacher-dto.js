module.exports = class TeacherDto {
    email;
    id;
    isActivated;
    roles;
    name;
    surname;
    avatar;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.roles = model.roles;
        this.name = model.name;
        this.surname = model.surname;
        this.avatar = model.avatar;

    }
}
