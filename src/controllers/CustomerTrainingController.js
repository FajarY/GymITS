const express = require('express');
const router = express.Router();
const trainingModel = require('../models/TrainingSessionModel');
const authentication = require('../middleware/Authentication');
const response = require('../utils/response');

async function startTrainingSession(req, res)
{
    const id = req.token.id;
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

    const c_id = req.token.id;
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
    const c_id = req.token.id;
    
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
        res.status(500).json(response.buildResponseFailed('error when getting training session id list', 'unknown server error', null));
    }
}

async function endTrainingSession(req, res)
{
    if(!req.params.id)
    {
        res.status(400).json(response.buildResponseFailed('error when ending training session', 'parameter id is undefined', null));
        return;
    }

    const c_id = req.token.id;
    const ts_id = req.params.id;

    const nowDate = new Date(Date.now());

    try
    {
        const trainingSession = await trainingModel.endTrainingSessionSafe(c_id, ts_id, nowDate);

        if(!trainingSession)
        {
            res.status(404).json(response.buildResponseFailed('error when ending training session', 'training session not found', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully ended training session', {
            id: trainingSession.id,
            start_time: trainingSession.start_time,
            end_time: trainingSession.end_time
        }));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when ending training session', error.message, null));
    }
}

router.get('/list', authentication.authenticate, authentication.authorize('customer'), getTrainingSessionIdList);
router.get('/data/:id', authentication.authenticate, authentication.authorize('customer'), getTrainingSessionData);
router.post('/start', authentication.authenticate, authentication.authorize('customer'), startTrainingSession);
router.post('/end/:id', authentication.authenticate, authentication.authorize('customer'), endTrainingSession);

module.exports = router;