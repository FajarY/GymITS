const express = require('express');
const response = require('../utils/response')
const productModel = require('../models/ProductModel');
const { authenticate, authorize } = require('../middleware/Authentication');
const { update } = require('../database');
const router = express.Router();

const getListProdcut = async (req, res) => {
    try {
        const product = await productModel.getAll();
        res.status(201).json(response.buildResponseSuccess("successfully adding product", product));
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

router.get('/data', getListProdcut)
router.post('/',authenticate, authorize('employee'), addNewProduct)
router.post('/:id', authenticate, authorize('employee'),addStockToProduct)
router.patch('/:id', authenticate, authorize('employee'), updateProduct)

module.exports = router;