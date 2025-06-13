const express = require('express');
const router = express.Router();
const trainingModel = require('../models/TrainingSessionModel');
const authentication = require('../middleware/Authentication');
const response = require('../utils/response');

async function startTrainingSession(req, res)
{
    const id = req.decodedToken.id;
    const nowDate = new Date(Date.now());

    try
    {
        const ts_id = await trainingModel.createTrainingSession(id, nowDate);

        if(!ts_id)
        {
            res.status(500).json(response.buildResponseFailed('error when creating training session', 'unknown server error', null));
            return;
        }

        res.status(201).json(response.buildResponseSuccess('successfully created training session', {
            id: ts_id
        }));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when creating training session', error.message, null));
    }
}

async function getTrainingSessionData(req, res)
{
    if(!req.params.id)
    {
        res.status(400).json(response.buildResponseFailed('error when getting training session data', 'parameter id is undefined', null));
        return;
    }

    const c_id = req.decodedToken.id;
    const ts_id = req.params.id;

    try
    {
        const trainingSession = await trainingModel.getTrainingSessionDataSafe(ts_id, c_id);
        if(!trainingSession)
        {
            res.status(404).json(response.buildResponseFailed('error when getting training session data', 'not found with training session id and customer id', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('successfully get training session data', trainingSession));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting training session data', 'unknown server error', null));
    }
}

async function getTrainingSessionIdList(req, res)
{
    const c_id = req.decodedToken.id;

    try
    {
        const id_arr = await trainingModel.getTrainingSessionIdList(c_id);

        if(!id_arr)
        {
            res.status(500).json(response.buildResponseFailed('error when getting training session id list', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('successfully get training session id list', id_arr));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting training session id list', error.message, null));
    }
}

async function endTrainingSession(req, res)
{
    if(!req.params.id)
    {
        res.status(400).json(response.buildResponseFailed('error when ending training session', 'parameter id is undefined', null));
        return;
    }

    const c_id = req.decodedToken.id;
    const ts_id = req.params.id;

    const nowDate = new Date(Date.now());

    try
    {
        const trainingSessionData = await trainingModel.getTrainingSessionDataSafe(ts_id, c_id);
        if(!trainingSessionData)
        {
            res.status(404).json(response.buildResponseFailed('error when ending training session', 'training session not found', null));
            return;
        }
        if(trainingSessionData.end_time != null)
        {
            res.status(400).json(response.buildResponseFailed('error when ending training session', 'training is already ended', null));
            return;
        }

        const trainingSession = await trainingModel.endTrainingSessionSafe(c_id, ts_id, nowDate);

        if(!trainingSession)
        {
            res.status(404).json(response.buildResponseFailed('error when ending training session', 'training session not found', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully ended training session', {
            id: trainingSession.ts_id,
            start_time: trainingSession.ts_start_time,
            end_time: trainingSession.ts_end_time
        }));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when ending training session', error.message, null));
    }
}

async function totalTrainingSession(req, res)
{
    const id = req.decodedToken.id;

    try
    {
        const data = await trainingModel.totalTrainingSession(id);

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when getting total training session', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully get total training session', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting total training session', error.message, null));
            return;
    }
}

async function streakTrainingSession(req, res)
{
    const id = req.decodedToken.id;

    try
    {
        const data = await trainingModel.getStreak(id);

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when getting training session streak', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully get training session streak', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting training session streak', error.message, null));
            return;
    }
}

router.get('/list', authentication.authenticate, authentication.authorize('customer'), getTrainingSessionIdList);
router.get('/data/:id', authentication.authenticate, authentication.authorize('customer'), getTrainingSessionData);
router.post('/start', authentication.authenticate, authentication.authorize('customer'), startTrainingSession);
router.post('/end/:id', authentication.authenticate, authentication.authorize('customer'), endTrainingSession);
router.get('/total', authentication.authenticate, authentication.authorize('customer'), totalTrainingSession);
router.get('/streak', authentication.authenticate, authentication.authorize('customer'), streakTrainingSession);

module.exports = router;