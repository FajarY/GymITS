const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/Authentication');
const response = require('../utils/response')

const customerModel = require('../models/CustomerModel');
const membershipModel = require('../models/MembershipModel');
const membershipTypeModel = require('../models/MembershipTypeModel');
const receiptModel = require('../models/ReceiptModel');
const membershipTypeReceiptModel = require('../models/MembershipTypeReceiptModel');

async function purchaseMembership(req, res)
{
    const id = req.decodedToken.id;

    const {telephone, alamat, membership_type_id, month_amount} = req.body;
    if(!telephone || !alamat || !membership_type_id || !month_amount)
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    try
    {
        membershipType = await membershipTypeModel.getData(membership_type_id);

        if(!membershipType)
        {
            res.status(400).json(response.buildResponseFailed('invalid membership_type_id', 'the membership_type_id given does not exist', null));
            return;
        }

        customerMembership = await membershipModel.getCustomerMembership(id);

        if(!customerMembership)
        {
            r_id = await receiptModel.createReceipt(id);

            if(!r_id)
            {
                res.status(500).json(response.buildResponseFailed('error when creating receipt', 'unknown server error!', null));
                return;
            }

            purchaseData = await membershipTypeReceiptModel.purchaseMembership(r_id.r_id, membership_type_id, month_amount);
            
            if(!purchaseData)
            {
                res.status(500).json(response.buildResponseFailed('error when creating receipt', 'fatal error when creating membership_type_receipt!', null));
                return;
            }

            const startDate = new Date(Date.now());
            var expiredDate = new Date(Date.now());
            expiredDate.setMonth(expiredDate.getMonth() + Number(month_amount));

            const membershipCreatedId = await membershipModel.createCustomerMembership(id, telephone, alamat, startDate, expiredDate, membershipType.id);

            if(!membershipCreatedId)
            {
                res.status(500).json(response.buildResponseFailed('error when creating membership', 'fatal error when creating membership after purchase!', null));
                return;
            }

            res.status(200).json(response.buildResponseSuccess('membership purchased successfully', {
                membership_id: membershipCreatedId.id,
                purchase_data: purchaseData
            }));
            return;
        }

        customerMembershipType = await membershipTypeModel.getData(customerMembership.mt_id);

        var update_start_date = new Date(customerMembership.startDate);
        var update_expired_date = new Date(customerMembership.expiredDate);
        var update_membership_type = membership_type_id;

        if(update_expired_date < new Date(Date.now()))
        {
            if(customerMembershipType.id != membershipType.id)
            {
                const nowLevel = Number(customerMembershipType.substring(1));
                const targetLevel = Number(membershipType.substring(1));

                if(targetLevel < nowLevel)
                {
                    res.status(500).json(response.buildResponseFailed('error when creating membership', 'cannot buy lower type membership if the active one is higher', null));
                    return;
                }
                else
                {
                    update_start_date = new Date(Date.now());
                    update_expired_date = new Date(Date.now());
                    update_expired_date.setMonth(update_expired_date.getMonth() + month_amount);
                }
            }
            else
            {
                update_expired_date.setMonth(update_expired_date.getMonth() + month_amount);
            }
        }
        else
        {
            update_start_date = new Date(Date.now());
            update_expired_date = new Date(Date.now());
            update_expired_date.setMonth(update_expired_date.getMonth() + month_amount);
        }
        
        r_id = await receiptModel.createReceipt(id);

        if(!r_id)
        {
            res.status(500).json(response.buildResponseFailed('error when creating receipt', 'unknown server error!', null));
            return;
        }

        purchaseData = await membershipTypeReceiptModel.purchaseMembership(r_id.r_id, membership_type_id, month_amount);
        if(!purchaseData)
        {
            res.status(500).json(response.buildResponseFailed('error when creating receipt', 'fatal error when creating membership_type_receipt!', null));
            return;
        }

        const updatedData = await membershipModel.updateCustomerMembershipSafe(customerMembership.id, id, customerMembership.telephone, customerMembership.alamat, update_start_date, update_expired_date, update_membership_type);

        res.status(200).json(response.buildResponseSuccess('membership purchased successfully', {
            membership_id: updatedData.m_id,
            purchase_data: purchaseData
        }));
    }
    catch(error)
    {
        console.log(error)
        res.status(500).json(response.buildResponseFailed('error when creating membership', error.message, null));
    }
}

router.post('/purchase', authenticate, authorize('customer'), purchaseMembership);

module.exports = router;