const express = require('express');
const response = require('../utils/response')
const productModel = require('../models/ProductModel');
const { authenticate, authorize } = require('../middleware/Authentication');
const router = express.Router();
const receiptModel = require('../models/ReceiptModel');
const receiptProductModel = require('../models/ReceiptProductModel');

const getListProdcut = async (req, res) => {
    try {
        const product = await productModel.getAll();
        res.status(200).json(response.buildResponseSuccess("successfully adding product", product));
        return;
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("failed create product", error.message, null));
    }
}

const getListProductFiltered = async (req, res) => {
        try {
        const id = req.id;
        
        const product = await productModel.getAllBought(id);
        res.status(200).json(response.buildResponseSuccess("successfully adding product", product));
        return;
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("failed create product", error.message, null));
    }
}

const addNewProduct = async (req, res) => {
    try {
        const {name, price} = req.body;
        const employee_id = req.id 

        const newProduct = await productModel.addNewProduct(name, price, employee_id);
        if(!newProduct) {
            res.status(500).json(response.buildResponseFailed("failed create product", "something wrong", null));
            return
        }

        res.status(201).json(response.buildResponseSuccess("successfully adding product", newProduct[0]));
        return;
    } catch (error) {
        res.status(500).json(response.buildResponseFailed("failed create product", error.message, null));
    }
}

const addStockToProduct = async (req, res) => {
    try {
        const {amount} = req.body;
        const employee_id = req.id;
        const product_id = req.params.id;

        const newStockProduct = await productModel.addProductStock(product_id, amount, employee_id);
        if(!newStockProduct) {
            res.status(500).json(response.buildResponseFailed("failed create product", "something wrong", null));
            return
        }

        res.status(201).json(response.buildResponseSuccess("successfully adding product", newStockProduct));
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("failed add product stock", error.message, null));
    }
}


const updateProduct = async(req, res) => {
    const allowedFields = ["name", "price"];
    const employee_id = req.id
    const product_id = req.params.id

    try {
        const updateKeys = Object.keys(req.body);
        if (updateKeys.length === 0) {
            res.status(400).json(buildResponseFailed("no fields to update", "invalid request body", null));
            return;
        }
    
        updateKeys.forEach((key) => {
            if (!allowedFields.includes(key)) {
                res.status(400).json(response.buildResponseFailed(`field ${key} is not allowed to be updated`, "invalid request body", null));
                return
            };
        });

        const updates = Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [`p_${key}`, value])
        ); 
        const product = await productModel.updatesProduct(employee_id, product_id, updates);

        res.status(200).json(response.buildResponseSuccess("successfully updating product", product));
    } catch(error) {
        res.status(500).json(response.buildResponseFailed("failed add product stock", error.message, null));
    }
}

const productSummary = async(req, res) => {
    try {
        const product = await productModel.productSummary();
        res.status(200).json(response.buildResponseSuccess("successfully get prodcut summary", product));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed("failed to get product summary", error.message, null));
    }
}

const percentageAddOnProductByemployee = async(req, res) => {
    try {
        const id = req.params.id
        const result = await productModel.percentageAddOnProductByemployee(id);
        res.status(200).json(response.buildResponseSuccess("successfully get summary", result));
    } catch (error) {
        res.status(500).json(response.buildResponseFailed("failed to get summary", error.message, null));
    }
}

async function getProductsDiscountSummary(req, res)
{
    try
    {
        const data = await productModel.productDiscountSummary();

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when getting product discount summary', 'unknown server error', null));
            return;
        }

        res.status(200).json(response.buildResponseSuccess('succesfully get product discount summary', data));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when getting product discount summary', error.message, null));
            return;
    }
}

router.get('/data', getListProdcut)
router.get('/bought',authenticate, getListProductFiltered)
router.post('/purchase', authenticate, authorize('customer'), purchaseProduct);
router.post('/',authenticate, authorize('employee'), addNewProduct);
router.post('/:id', authenticate, authorize('employee'),addStockToProduct);
router.patch('/:id', authenticate, authorize('employee'), updateProduct);
router.get('/summary/data', authenticate, authorize('employee'), productSummary);
router.get('/:id/employee/summary', authenticate, authorize('employee'), percentageAddOnProductByemployee);
router.get('/productsDiscountsTotal', authenticate, authorize('employee'), getProductsDiscountSummary);

async function purchaseProduct(req, res)
{
    if(!req.body)
    {
        res.status(400).json(response.buildResponseFailed('request body is missing', 'invalid request body', null));
        return;
    }

    const c_id = req.decodedToken.id;
    const { purchase } = req.body;
    if(!purchase || !Array.isArray(purchase))
    {
        res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
        return;
    }

    var sanitizedPurchase = [];
    try
    {
        for(var i = 0; i < purchase.length; i++)
        {
            if(!purchase[i].id || !purchase[i].amount)
            {
                res.status(400).json(response.buildResponseFailed('missing required fields', 'invalid request body', null));
                return;
            }

            const amount = Number(purchase[i].amount);
            const existStatus = await productModel.isProductExistAndCheckStock(purchase[i].id, amount);
            if(existStatus == 0)
            {
                res.status(400).json(response.buildResponseFailed('product id does not exist', 'invalid product id', null));
                return;
            }
            else if(existStatus == 1)
            {
                res.status(400).json(response.buildResponseFailed('failed when purchasing', 'the amount to buy exceeds stock', null));
                return;
            }
            sanitizedPurchase.push({p_id: purchase[i].id, rp_amount: amount});
        }
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when purchasing product', 'the type of purchase fields may be incorrect', null));
        return;
    }

    try
    {
        const data = await receiptModel.createReceipt(c_id);

        if(!data)
        {
            res.status(500).json(response.buildResponseFailed('error when purchasing product', 'there was a problem when creating receipt', null));
            return;
        }
        const r_id = data.r_id;
        for(var i = 0; i < sanitizedPurchase.length; i++)
        {
            sanitizedPurchase[i].r_id = r_id;
        }
        
        const return_arr = await receiptProductModel.insertPurchases(sanitizedPurchase);
        
        if(return_arr.length != sanitizedPurchase.length)
        {
            res.status(500).json(response.buildResponseFailed('error when purchasing product', 'the inserted length is not the same as the purchase', null));
            return;
        }

        res.status(201).json(response.buildResponseSuccess('succesfully purchased product', {
            purchased: return_arr
        }));
    }
    catch(error)
    {
        res.status(500).json(response.buildResponseFailed('error when purchasing product', error.message, null));
    }
}

module.exports = router;