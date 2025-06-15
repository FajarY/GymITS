const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const customerModel = require('../models/CustomerModel');
const response = require('../utils/response');
const jwt = require('../utils/jwt');
const trainingController = require('./CustomerTrainingController');
const { authenticate, authorize } = require('../middleware/Authentication');

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
    if(!req.body)
    {
        res.status(400).json(response.buildResponseFailed('request body is missing', 'invalid request body', null));
        return;
    }
    const {email, password} = req.body;

    if(!email || !password)
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    try
    {
        const customer = await customerModel.getCustomerByEmail(email);
        if(customer == undefined)
        {
            res.status(401).json(response.buildResponseFailed('failed to login', 'invalid email or password', null));
            return;
        }

        const isPasswordValid = await bcryptjs.compare(password, customer.password);
        if(!isPasswordValid)
        {
            res.status(401).json(response.buildResponseFailed('failed to login', 'invalid email or password', null));
            return;
        }

        const token = jwt.generateTokenFromObject({
            id: customer.id,
            email: customer.email,
            role: 'customer'
        });

        res.cookie('token', token, {maxAge: 604800000});
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
    if(!req.body)
    {
        res.status(400).json(response.buildResponseFailed('request body is missing', 'invalid request body', null));
        return;
    }
    const {name, gender, email, password} = req.body;

    if(!name || !gender || !email || !password)
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    try
    {
        const customer = await customerModel.getCustomerByEmail(email);
        if(customer != undefined)
        {
            res.status(401).json(response.buildResponseFailed('failed to register', 'email is already registered', null));
            return;
        }

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

async function profileCustomer(req, res) {
    try {
        const id = req.id;
        const customer = await customerModel.getProfile(id);
        if(!customer) {
            res.status(400).json(response.buildResponseFailed('failed to get customer profile', 'customer does not exist', null));
            return;
        }
        
        res.status(200).json(response.buildResponseSuccess('customer registered successfully', customer));
    } catch (error) {
        
        res.status(500).json(response.buildResponseFailed('failed to get customer profile', error.message, null));
    }
}

async function customerAppointments(req, res) {
    try {
        const id = req.id;
        const customer = await customerModel.getAppointments(id)
        if(!customer) {
            res.status(401).json(response.buildResponseFailed('failed to get customer appointments', 'something wrong', null));
            return;
        }
        
        res.status(200).json(response.buildResponseSuccess('successfully get customer appointments', customer));
    }  catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to get customer appointments', error.message, null));
    }
}

async function customerOnGym(req, res) {
    try {
        const customers = await customerModel.customerOnGym();
        console.log(customers)
        res.status(200).json(response.buildResponseSuccess('successfully get customer count', customers));
    } catch(error) {
        res.status(500).json(response.buildResponseFailed('failed to get customers', error.message, null));
    }
}

//Fajar Query Join 1
async function efficiencyAllMembersipCustomer(req, res)
{
    try
    {
        const data = await customerModel.efficiencyAllMembersip();

        res.status(200).json(response.buildResponseSuccess('successfully get all  customer membership efficiency', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('failed to get efficiency of membership on all customers', error.message, null));
    }
}

const getTrainingSessionStatistic = async (req, res) => {
    try {
        const id = req.id;
        const statistic = await customerModel.getTrainingStatistic(id);
        
        res.status(200).json(response.buildResponseSuccess('successfully get customer statistic', statistic));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to get statistic', error.message, null));
    }
}

const getCustomerTotalSpending = async (req, res) => {
    try {
        const id = req.id;
        const spend = await customerModel.totalSpending(id);
        
        res.status(200).json(response.buildResponseSuccess('successfully get customer spending', {spending: spend.get_total_spending}));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to get customer spending', error.message, null));
    }
}

router.post('/login', loginCustomer);
router.post('/register', registerCustomer);
router.use('/training', trainingController);
router.get('/profile', authenticate, authorize('customer'), profileCustomer);
router.get('/appointments', authenticate, authorize('customer'), customerAppointments)
router.get('/countOnGym', customerOnGym);

router.get('/training-session-statistic', authenticate, authorize('customer'), getTrainingSessionStatistic);
router.get('/total-spending', authenticate, authorize('customer'), getCustomerTotalSpending);

router.get('/efficiencyAllMemberships', efficiencyAllMembersipCustomer)

module.exports = router;