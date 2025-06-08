const response = require('../utils/response');
const jwt = require('../utils/jwt')


const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = '';

    if (!authHeader) {
        
        if(!req.cookies.token) {
            res.status(401).json(response.buildResponseFailed('failed to process request', 'token not found', null));
            return;
        }

        token = req.cookies.token;
    } else {
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json(response.buildResponseFailed('failed to process request', 'Token not valid', null));
        }

        token = authHeader.slice(7); 
    }

    try {
        const decoded = jwt.validateToken(token);

        if (!decoded) {
            return res.status(401).json(response.buildResponseFailed('failed to process request', 'access denied', null));
        }

        const id = decoded.id;
        if (!id) {
            return res.status(401).json(response.buildResponseFailed('failed to process request', 'user ID not found in token', null));
        }

        const role = decoded.role;
        if (!role) {
            return res.status(401).json(response.buildResponseFailed('failed to process request', 'user role not found in token', null));
        }

        req.token = token;
        req.id = String(id); 
        req.role = role
        next();
    } catch (error) {
        return res.status(401).json(response).buildResponseFailed('failed to process request', 'invalid token', null);
    }
};

const authorize = (requiredRole) => {
    return (req, res, next) => {
        if (req.role != requiredRole) {
            return res.status(403).json(response.buildResponseFailed('Failed to process request', 'Access denied', null));
        }
        next();
    };
};

module.exports = { authenticate, authorize }