const express = require('express');
const response = require('../utils/response');
const bcrypt = require('bcryptjs')
const jwt = require('../utils/jwt')
const {authenticate, authorize} = require('../middleware/Authentication')
const personalTrainerModel = require('../models/PersonalTrainerModel');
const router = express.Router();

if(!process.env.BCRYPT_SALT_ROUNDS)
{
    throw new Error('BCRYPT_SALT_ROUNDS is not defined!');
}
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);

const loginPersonalTrainer = async (req, res) => {    
    try {
        const {id, password} = req.body;
        if (!id || !password) {
        res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
        return;
        }

        const personalTrainer = await personalTrainerModel.getByID(id)

        const isPasswordValid = await bcrypt.compare(password, personalTrainer.password);
        if(!isPasswordValid) {
            res.status(401).json(response.buildResponseFailed("invalid password", "invalid password", null));
            return;
        }

        const token = jwt.generateToken(personalTrainer.id, "trainer")

        const result = {
            token: token,
            role: "trainer"
        }

        res.cookie('token', token, {maxAge: 360000});
        res.status(200).json(response.buildResponseSuccess("logged in successfully", result));
        return;
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed to login", error.message, null));
        return;
    }
}

const addPersonalTrainer = async (req, res) => {
    try {
        const employeeID = req.id
        const {name, alamat, password, telephone, gender, price_per_hour} = req.body;

        if (!name || !alamat || !password || !telephone || !gender || !price_per_hour) {
            res.status(400).json(response.buildResponseFailed("missing required fields", "invalid request body", null));
            return;
        }

        hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        
        const newPersonalTrainer = await personalTrainerModel.create(name, alamat, hashedPassword, telephone, gender, price_per_hour, employeeID);
        
        if(!newPersonalTrainer) {
            res.status(500).json(response.buildResponseFailed("failed create user", "something wrong", null));
            return;
        }
        
        res.status(201).json(response.buildResponseSuccess("personal trainer created successfully", req.body));
        return;
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed create user", error.message, null));
        return;
    }
}

const getAllPersonalTrainer = async (req, res) => {
    try {
        const personalTrainer = await personalTrainerModel.getAll();
        res.status(200).json(response.buildResponseSuccess("successfully get all personal trainer", personalTrainer));
        return;
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("fail to get all personal trainer", error.message, null));
    }
}

const getPersonalTrainerAvailability = async (req, res) => {
    try {
        const personal_trainer_id = req.params.id;
        const now = new Date();

        const month = Number(req.query.month) || now.getMonth() + 1;
        const year = Number(req.query.year) || now.getFullYear();

        const available_time = await personalTrainerModel.getAvailableTime(personal_trainer_id, month, year);

        res.status(200).json(response.buildResponseSuccess("successfully get personal trainer availability.", available_time));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed("failed to get personal trainer available time.", error.message, null));
    }
};

const profile = async(req, res) => {
    try {
        const id = req.id;
        const personalTrainer = await personalTrainerModel.getProfile(id);
        if(!personalTrainer) {
            res.status(400).json(response.buildResponseFailed('failed to get personal profile', 'personal trainer does not exist', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess("successfully get personal trainer profile", personalTrainer));
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("failed to get personal trainer profile", error.message, null));
    }
}

async function trainerAppointments(req, res) {
    try {
        const id = req.id;
        const personalTrainer = await personalTrainerModel.getAppointments(id)
        if(!personalTrainer) {
            res.status(401).json(response.buildResponseFailed('failed to get personal trianer appointments', 'something wrong', null));
            return;
        }
        
        res.status(200).json(response.buildResponseSuccess('successfully get personal trianer appointments', personalTrainer));
    }  catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to get personal trianer appointments', error.message, null));
    }
}

router.post('/login', loginPersonalTrainer);
router.post('/', authenticate, authorize('employee'), addPersonalTrainer);
router.get('/data', authenticate, getAllPersonalTrainer);
router.get('/profile', authenticate, profile);
router.get('/:id/availability', authenticate, getPersonalTrainerAvailability);
router.get('/appointments', authenticate, authorize('trainer'), trainerAppointments);

module.exports = router;