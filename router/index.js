const Router = require('express').Router;
const studentController = require('../controllers/student-controller');
const teacherController = require('../controllers/teacher-controller');
const adminController = require('../controllers/admin-controller');
const lessonController = require('../controllers/lesson-controller');
const classController = require('../controllers/class-controller');

const router = new Router();
const {body} = require('express-validator');
const roleMiddleware = require('../middlewares/role-middleware');

//class 
router.post('/classes/list', roleMiddleware(['TEACHER', 'ADMIN']), classController.getMyClasses);
router.post('/classes/one', roleMiddleware(['TEACHER', 'ADMIN']), classController.getOneClass);


//lesson
router.post('/lesson/create',
    body('teacherId').notEmpty(),
    body('classId').notEmpty(),
    body('className').notEmpty(),
    body('gameType').notEmpty(),
    body('gameTime').isNumeric().notEmpty(),
    body('data').isArray(),
    roleMiddleware(['ADMIN']),
    lessonController.create
);
router.post('/lesson/list', roleMiddleware(['TEACHER', 'ADMIN']), lessonController.getMyLessons);
router.post('/lesson/one', roleMiddleware(['TEACHER', 'ADMIN']), lessonController.getOneLesson);



// teacher
router.post('/registration/teacher',
    body('email').isEmail(),
    body('password').isLength({min: 6, max: 100}),
    body('name').isLength({min: 1, max: 100}),
    body('surname').isLength({min: 1, max: 100}),
    teacherController.registration
);
router.post('/login/teacher', teacherController.login);
router.post('/logout/teacher', teacherController.logout);
router.get('/activate/teacher/:link', teacherController.activate);
router.get('/refresh/teacher', teacherController.refresh);
router.get('/teachers', roleMiddleware(['TEACHER', 'ADMIN']), teacherController.getTeachers);
router.post('/update/teacher',
    body('name').isLength({min: 1, max: 100}),
    body('surname').isLength({min: 1, max: 100}),
    roleMiddleware(['TEACHER', 'ADMIN']),
    teacherController.updateProfileTeacher);

// admin
router.post('/registration/admin',
    body('email').isEmail(),
    body('password').isLength({min: 6, max: 50}),
    adminController.registration
);
router.post('/login/admin', adminController.login);
router.post('/logout/admin', adminController.logout);
router.get('/activate/admin/:link', adminController.activate);
router.get('/refresh/admin', adminController.refresh);
router.get('/admins', roleMiddleware(['ADMIN']), adminController.getAdmins);


// student
router.post('/registration/student',
    studentController.registration
);
router.post('/login/student', studentController.login);
router.get('/profile/student', studentController.getMyProfile);
router.get('/student/lessons', roleMiddleware(['STUDENT']), studentController.getStudentLessons);
router.get('/students', roleMiddleware(['TEACHER']), studentController.getStudents);
router.post('/student/statistic/access/teacher', 
    roleMiddleware(['TEACHER', 'STUDENT', 'ADMIN']),
    studentController.getStudentStatisticForStudent);

module.exports = router
