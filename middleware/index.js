const { HandleServerError, UnauthorizedError } = require("../controllers/Base.controller");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");


const VerifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) {
            return UnauthorizedError(res);
        }

        const clientIpHeader = req.headers['x-forwarded-for'];
        const clientIp = clientIpHeader ? clientIpHeader.split(",")[0].trim() : null;
        if (!clientIp) {
            return UnauthorizedError(res);
        }

        // support both "Bearer <token>" and raw "<token>"
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) {
            return UnauthorizedError(res);
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not set');
            return HandleServerError(res, req, new Error('Server configuration error'));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) {
                return UnauthorizedError(res);
            }

            // check if user id exits in user table
            UserModel.findById(data.id).then(user => {
                if (!user) {
                    return UnauthorizedError(res);
                }
            }).catch(err => {
                return HandleServerError(res, req, err);
            });

            if (data.ip !== clientIp) {
                console.warn(`IP mismatch: You accessed it with different Device or network. Token IP: ${data.ip}, Request IP: ${clientIp}`);
                return UnauthorizedError(res);
            }
            req.user = data;
            req.ip = clientIp;

            next();
        });
    } catch (error) {
        HandleServerError(res, req, error);
    }
}

exports.VerifyToken = VerifyToken;