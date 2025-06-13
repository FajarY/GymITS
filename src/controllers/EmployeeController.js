const express = require('express');
const response = require('../utils/response');
const bcrypt = require('bcryptjs')
const jwt = require('../utils/jwt')
const employeeModel = require('../models/EmployeeModel');
const { authenticate, authorize } = require('../middleware/Authentication');
const router = express.Router();

const loginEmployee= async (req, res) => {
    
    try {
        const {id, password} = req.body;
        
        if (!id || !password) {
            res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
            return;
        }

        const employee = await employeeModel.getByID(id)

        if (!employee) {
            res.status(400).json(response.buildResponseFailed("employee account not found", "employee does not exist", null));
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if(!isPasswordValid) {
            res.status(401).json(response.buildResponseFailed("invalid password", "invalid password", null));
            return;
        }

        const token = jwt.generateToken(employee.id, "employee")

        const result = {
            token: token,
            role: "employee"
        }

        res.cookie('token', token, {maxAge: 360000});
        res.status(200).json(response.buildResponseSuccess("logged in successfully", result))
        return;
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed to login", error.message, null));
        return;
    }
}

const profile = async (req, res) => {
    try {
        const id = req.id;
        const employee = await employeeModel.getProfile(id);
        if(!employee) {
            res.status(400).json(response.buildResponseFailed('failed to get employee profile', 'employee does not exist', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess("successfully get employee profile", employee));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed("failed to get employee profile", error.message, null));
    }
}

router.post('/login', loginEmployee);
router.get('/profile', authenticate, profile);

async function getAllPeopleOnDatabase(req, res)
{
    try
    {
        const data = await employeeModel.getAllPeopleOnDatabase();

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when getting all people data', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully get all people data', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting all people data', error.message, null));
            return;
    }
}

router.get('/getAllPeopleOnDatabase', authenticate, authorize('employee'), getAllPeopleOnDatabase);

module.exports = router;