const classService = require('../service/class-service');

class ClassController {
    async getMyClasses(req, res, next) {
        try {
            const {mongoTeacherId} = req.body;
            const classes = await classService.getMyClasses(mongoTeacherId);
            return res.json(classes);
        } catch (e) {
            next(e);
        }
    }

    async getOneClass(req, res, next) {
        try {
            const {mongoTeacherId, mongoClassId} = req.body;
            const classes = await classService.getOneClass(mongoTeacherId, mongoClassId);
            return res.json(classes);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new ClassController();