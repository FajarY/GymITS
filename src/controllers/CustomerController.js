const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const customerModel = require('../models/CustomerModel');
const response = require('../utils/response');
const jwt = require('../utils/jwt');

if(!process.env.BCRYPT_SALT_ROUNDS)
{
    throw new Error('BCRYPT_SALT_ROUNDS is not defined!');
}
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);

if(!process.env.JWT_SECRET)
{
    throw new Error('JWT_SECRET is not defined!');
}
const JWT_SECRET = Number(process.env.JWT_SECRET);

async function loginCustomer(req, res)
{
    const {email, password} = req.body;

    if(!email || !password)
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    try
    {
        const customer = customerModel.getCustomerByEmail(email);

        const isPasswordValid = bcryptjs.compare(password, customer.password);
        if(!isPasswordValid)
        {
            res.status(401).json(response.buildResponseFailed('invalid password', 'invalid password'));
            return;
        }

        const token = jwt.generateTokenFromObject({
            id: customer.id,
            email: customer.email,
            role: 'customer'
        });

        res.cookie('token', token, {maxAge: 360000});
        res.status(200).json(response.buildResponseSuccess('login successfully', {
            token
        }));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('failed to login', error.message, null));
    }
}

async function registerCustomer(req, res)
{
    const {name, gender, email, password} = req.body;

    if(!name || !gender || !email || !password)
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    try
    {
        const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);
        createdId = await customerModel.createCustomer(name, gender, email, hashedPassword);

        if(!createdId)
        {
            res.status(500).json(response.buildResponseFailed('error when registering user', 'server error or possiblity of email taken', null));
            return;
        }

        res.status(201).json(response.buildResponseSuccess('customer registered successfully', req.body));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('failed to register', error.message, null));
    }
}

router.post('/login', loginCustomer);
router.post('/register', registerCustomer);

module.exports = router;