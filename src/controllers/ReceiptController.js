const express = require('express');
const router = express.Router();
const receiptModel = require('../models/ReceiptModel');
const response = require('../utils/response')
const { authenticate, authorize } = require('../middleware/Authentication');

const getAllReceipt = async (req, res) => {
    try {
        const id = req.id;
        const result = await receiptModel.getAllReceipt(id);

        const receipts = {};
        
        result.forEach(row => {
            const receipt_id = row.receipt_id;

            if (!receipts[receipt_id]) {
                receipts[receipt_id] = {
                    receipt_id,
                    receipt_date: row.receipt_date,
                    receipt_final_price: row.receipt_final_price,
                    items: [],
                    temp: new Set()
                };
            }

            if (row.product_name && row.total_per_product && !receipts[receipt_id].temp.has(row.product_id)) {
                receipts[receipt_id].items.push({
                    name: row.product_name,
                    total_price: Number(row.total_per_product)
                });
                receipts[receipt_id].temp.add(row.product_id)
            }

            if (row.membership_type && row.total_membership && !receipts[receipt_id].temp.has(row.membership_id)) {
                receipts[receipt_id].items.push({
                    name:`${row.membership_type} Membership`,
                    total_price: Number(row.total_membership)
                });

                receipts[receipt_id].temp.add(row.membership_id)
            }
            
            if (row.personal_trainer_name && row.total_personal_trainer && !receipts[receipt_id].temp.has(row.personal_trainer_id)) {
                receipts[receipt_id].items.push({
                    name: `${row.personal_trainer_name} Appointment`,
                    total_price: Number(row.total_personal_trainer)
                });
                receipts[receipt_id].temp.add(row.personal_trainer_id)
            }
        });

        const results = Object.values(receipts).map(r => {
            delete r.temp;
            return r;
        });
        res.status(200).json(response.buildResponseSuccess('successfuly get customer receipt history', results));
    } catch(error) {
        res.status(500).json(response.buildResponseSuccess('failed to get customer receipt history', error.message, null));
    }
}

async function getRevenueOnDay(req, res)
{
    if(!req.body)
    {
        res.status(400).json(response.buildResponseFailed('error when getting revenue on date and gender', 'body cannot be empty!', null));
        return;
    }

    const {date, gender} = req.body;
    if(!date || !gender)
    {
        res.status(400).json(response.buildResponseFailed('error when getting revenue on date and gender', 'date and gender is empty!', null));
        return;
    }

    try
    {
        const data = await receiptModel.getRevenueOnDateAndGender(date, gender);

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when getting revenue on date and gender', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully getting revenue on date and gender', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting revenue on date and gender', error.message, null));
            return;
    }
}

router.get('/history', authenticate, getAllReceipt);
router.get('/revenueOnDay', authenticate, authorize('employee'), getRevenueOnDay);

module.exports = router;