const bcrypt = require('bcryptjs')

const dotenv = require('dotenv');
dotenv.config();

async function damn()
{
    const val = await bcrypt.hash('ptpass', Number(process.env.BCRYPT_SALT_ROUNDS))
    console.log(val)
}


damn()