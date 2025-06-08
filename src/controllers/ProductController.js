const express = require('express');
const response = require('../utils/response')
const productModel = require('../models/ProductModel');
const { authenticate, authorize } = require('../middleware/Authentication');
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
        const employeeID = req.id 

        const newProduct = await productModel.addNewProduct(name, price, employeeID);
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
        const employeeID = req.id;
        const product_id = req.params.id;

        const newStockProduct = await productModel.addProductStock(product_id, amount, employeeID);
        if(!newStockProduct) {
            res.status(500).json(response.buildResponseFailed("failed create product", "something wrong", null));
            return
        }

        res.status(201).json(response.buildResponseSuccess("successfully adding product", newStockProduct));
    }catch(error) {
        res.status(500).json(response.buildResponseFailed("failed add product stock", error.message, null));
    }
}

router.get('/data', getListProdcut)
router.post('/',authenticate, authorize('employee'), addNewProduct)
router.post('/:id', authenticate, authorize('employee'),addStockToProduct)

module.exports = router;