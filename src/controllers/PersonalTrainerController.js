const express = require('express');
const response = require('../utils/response');
const bcrypt = require('bcryptjs')
const jwt = require('../utils/jwt')
const {authenticate, authorize} = require('../middleware/Authentication')
const personalTrainerModel = require('../models/PersonalTrainerModel');
const router = express.Router();

const loginPersonalTrainer = async (req, res) => {
    const {id, password} = req.body;
    if (!id || !password) {
       res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
    }
    
    try {
        const personalTrainer = await personalTrainerModel.getByID(id)

        const isPasswordValid = await bcrypt.compare(password, personalTrainer.password);
        if(!isPasswordValid) {
            res.status(401).json(response.buildResponseFailed("invalid password", "invalid password", null));
        }

        const token = jwt.generateToken(personalTrainer.id, "trainer")

        const result = {
            token: token,
            role: "trainer"
        }

        res.status(200).json(response.buildResponseSuccess("logged in successfully", result))
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed to login", error.message, null));
    }
}

const addPersonalTrainer = async (req, res) => {
    const employeeID = req.id
    const {name, alamat, password, telephone, gender, price_per_hour} = req.body;

    if (!name || !alamat || !password || !telephone || !gender || !price_per_hour) {
        res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
    }

    hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newPersonalTrainer = await personalTrainerModel.create(name, alamat, hashedPassword, telephone, gender, price_per_hour, employeeID);
        
        if(!newPersonalTrainer) {
            res.status(500).json(response.buildResponseFailed("failed create user", "something wrong", null));
        }
        
        res.status(201).json(response.buildResponseSuccess("personal trainer created successfully", req.body));
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed create user", error.message, null));
    }
}


router.post('/login', loginPersonalTrainer);
router.post('/', authenticate, authorize('employee'), addPersonalTrainer);

module.exports = router;