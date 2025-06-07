const express = require('express')
const path = require('path')

const app = express()

const staticPath = path.join(__dirname, '../', 'public');
console.log(staticPath)
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