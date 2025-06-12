const express = require('express');
const router = express.Router();
const response = require('../utils/response')
const appointmentModel = require('../models/AppointmentModel');
const { authenticate, authorize } = require('../middleware/Authentication');

const purchaseAppointment = async (req, res) => { 
    try {
        const id = req.id;
        const {pt_id, date, times} = req.body;
        
        if (!pt_id || !date || !times || times.length == 0) {
            res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
            return;
        }

        const newReceipt = await appointmentModel.addPersonalTrainerReceipt(pt_id, times, date, id);

        res.status(201).json(response.buildResponseSuccess('successfully add available time', newReceipt));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed('failed to add available time', error.message, null));
    }
}

router.post('/purchase',authenticate, authorize('customer'), purchaseAppointment);

module.exports = router;