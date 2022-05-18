const AdminModel = require('../models/admin-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const AdminDto = require('../dtos/admin-dto');
const ApiError = require('../exceptions/api-error');

class AdminService {
    async registration(adminId, email, password) {
        if(process.env.ADMIN_CODE !== adminId) {
            throw ApiError.BadRequest(`Это не правильный adminId`)
        }
        const candidate = await AdminModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const admin = await AdminModel.create({adminId, email, password: hashPassword, activationLink, roles: ["ADMIN"]})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/admin/${activationLink}`);

        const adminDto = new AdminDto(admin); // id, email, isActivated, roles
        const tokens = tokenService.generateBothTokens({...adminDto});
        await tokenService.saveAdminToken(adminDto.id, tokens.refreshToken);

        return {...tokens, admin: adminDto}
    }

    async activate(activationLink) {
        const admin = await AdminModel.findOne({activationLink})
        if (!admin) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        admin.isActivated = true;
        await admin.save();
    }

    async login(email, password) {
        const admin = await AdminModel.findOne({email})
        if (!admin) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, admin.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const adminDto = new AdminDto(admin);
        const tokens = tokenService.generateBothTokens({...adminDto});

        await tokenService.saveAdminToken(adminDto.id, tokens.refreshToken);
        return {...tokens, admin: adminDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeAdminToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const adminData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findAdminToken(refreshToken);
        if (!adminData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const admin = await AdminModel.findById(adminData.id);
        const adminDto = new AdminDto(admin);
        const tokens = tokenService.generateBothTokens({...adminDto});

        await tokenService.saveAdminToken(adminDto.id, tokens.refreshToken);
        return {...tokens, admin: adminDto}
    }

    async getAllAdmin() {
        const admins = await AdminModel.find();
        return admins;
    }
}

module.exports = new AdminService();