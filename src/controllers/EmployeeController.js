const express = require('express');
const response = require('../utils/response');
const bcrypt = require('bcryptjs')
const jwt = require('../utils/jwt')
const employeeModel = require('../models/EmployeeModel')
const router = express.Router();

const loginEmployee= async (req, res) => {
    
    try {
        const {id, password} = req.body;
        
        if (!id || !password) {
           res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
           return;
        }

        const employee = await employeeModel.getByID(id)

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

        res.status(200).json(response.buildResponseSuccess("logged in successfully", result))
        return;
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed to login", error.message, null));
        return;
    }
}

router.post('/login', loginEmployee);
module.exports = router;