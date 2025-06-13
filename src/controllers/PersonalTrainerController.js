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
        const id = req.id;
        const filter = req.query.filter;

        let personalTrainer;
        if (filter == 'used') {
            personalTrainer = await personalTrainerModel.getAllUsed(id);
        } else {
            personalTrainer = await personalTrainerModel.getAll();
        }
        res.status(200).json(response.buildResponseSuccess("successfully get all personal trainer", personalTrainer));
        return;
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("fail to get all personal trainer", error.message, null));
    }
}

const getPersonalTrainerAvailability = async (req, res) => {
    try {
        const personal_trainer_id = req.params.id;

        const day = parseInt(req.query.day) || null;
        const month = parseInt(req.query.month) || null;
        const year = parseInt(req.query.year) || null;

        if (!month || !year) {
            res.status(400).json(response.buildResponseFailed("atleast there is value in month and year", "invalid query", null));
            return;
        }

        const available_time = await personalTrainerModel.getAvailableTime(personal_trainer_id, month, year, day);

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

async function efficiencyAllPTAvailableTimes(req, res)
{
    try
    {
        const data = await personalTrainerModel.getEfficiencyAllPTAvailableTimes();

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('failed to get personal trainer efficiency times', 'something wrong', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('successfully get all personal trainer efficiency of available times', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('failed to get all PT Available times efficiency', error.message, null));
    }
}

const addAvailableTime = async (req, res) => {
    try {
        const id = req.id;
        const {date, times} = req.body;
        
        if (!date || !times) {
            res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
            return;
        }
        
        for(let i = 0; i < times.length; i++) {
            if(times[i] < 0 || times[i] > 13) {
                res.status(400).json(response.buildResponseFailed("times must be in range 0 to 13", "invalid request body", null));
                return;
            }
        }
        
        const inserted = await personalTrainerModel.addAvailableTime(id, date, times);
        res.status(201).json(response.buildResponseSuccess('successfully add available time', {inserted}));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to add available time', error.message, null));
    }
}

const income = async (req, res) => {
    try {
        const id = req.id;
        const income = await personalTrainerModel.getIncome(id); 
        res.status(200).json(response.buildResponseSuccess('successfully to get trainer income', income));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to get trainer income', error.message, null));
    }
}

const getNewTrainerLog = async (req, res) => {
    try {
        const log = await personalTrainerModel.getTrainerLog()
        res.status(200).json(response.buildResponseSuccess('successfully to get tariner log', log));
    } catch (error) {
        res.status(500).json(response.buildResponseSuccess('failed to get tariner log', log));
    }
}

router.post('/login', loginPersonalTrainer);
router.post('/', authenticate, authorize('employee'), addPersonalTrainer);
router.get('/data', authenticate, getAllPersonalTrainer);
router.get('/profile', authenticate, profile);
router.get('/:id/availability', authenticate, getPersonalTrainerAvailability);
router.get('/appointments', authenticate, authorize('trainer'), trainerAppointments);
router.get('/income', authenticate, authorize('trainer'), income);
router.get('/log', authenticate, authorize('employee'), getNewTrainerLog);

router.get('/efficiencyAllPTAvailableTimes', efficiencyAllPTAvailableTimes)
router.post('/available-time', authenticate, authorize('trainer'), addAvailableTime);

module.exports = router;