const response = require('../utils/response');
const jwt = require('../utils/jwt')


const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json(response.buildResponseFailed('failed to process request', 'token not found', null));
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json(response.buildResponseFailed('failed to process request', 'Token not valid', null));
    }

    const token = authHeader.slice(7); 
    
    if (!token) {
        token = req.cookies.token;
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