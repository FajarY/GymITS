const express = require('express');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const customer = require('./controllers/CustomerController');
const personalTrainer = require('./controllers/PersonalTrainerController');
const employee = require('./controllers/EmployeeController');
const product = require('./controllers/ProductController');
const appointment = require('./controllers/AppointmentController');
const receipt = require('./controllers/ReceiptController');
const membership = require('./controllers/MembershipController');

const app = express()

const staticPath = path.join(__dirname, '../', 'public');

app.use(express.json())
app.use('/customer', customer);
app.use('/personaltrainer', personalTrainer);
app.use('/employee', employee);
app.use('/product', product);
app.use('/appointment', appointment);
app.use('/receipt', receipt);
app.use('/membership', membership);
app.use(express.static(staticPath));

const PORT = 8080;
app.listen(PORT, (error) =>
{
    if(error)
    {
        console.log(`Error when starting application ${error}`);
    }
    else
    {
        console.log(`Application started at ${PORT}`);
    }
});