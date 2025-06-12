const db = require('../database');

const addPersonalTrainerReceipt = async (pt_id, times, date, customer_id) => {
    const result = await db.transaction( async (trx) => {
        try {
            const validateQuery = `
                SELECT COUNT(*) AS valid 
                FROM available_time 
                WHERE at_id = ANY(?) AND pt_id = ? AND c_id IS NULL            
            `
            const validationResult = await trx.raw(validateQuery, [times, pt_id]);

            console.log(validationResult.rows[0].valid)
            if (validationResult.rows[0].valid != times.length) {
                throw new Error('some range are not valid because not availabel anymore');
            }

            const insertQuery = `
                INSERT INTO receipt(r_date, r_final_price, c_id) VALUES
                (CURRENT_DATE, 0.0, ?)
                RETURNING *;
            `
            const receipt = await trx.raw(insertQuery, [customer_id]);
            const newReceipt = receipt.rows[0];

            const personalTrainerQuery = `
                SELECT pt_price_per_hour FROM personal_trainer WHERE pt_id = ?
            `
            const trainerResult = await trx.raw(personalTrainerQuery, [pt_id]);
            if (trainerResult.rowCount === 0) {
                throw new Error('personal trainer not found');
            }

            const insertPtReceiptQuery = `
                INSERT INTO personal_trainer_receipt (r_id, pt_id, ptr_price_per_hour, ptr_hour_amount, ptr_discount) VALUES 
                (?, ?, ?, ?, 0.0) 
                RETURNING *;
            `;
            const result = await trx.raw(insertPtReceiptQuery, [newReceipt.r_id, pt_id, trainerResult.rows[0].pt_price_per_hour, times.length]);
      
            const updateAvailabilityQuery = 'UPDATE available_time SET c_id = ? WHERE at_id = ANY(?)';
            await trx.raw(updateAvailabilityQuery, [customer_id, times]);

            return {
                receipt_id: newReceipt.r_id,
                date: newReceipt.r_date,
                purchased: {
                    personal_trainer_id: result.rows[0].pt_id,
                    hour_amount: result.rows[0].ptr_hour_amount,
                    total_price: result.rows[0].ptr_price_per_hour * result.rows[0].ptr_hour_amount * (1 - result.rows[0].ptr_discount)
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error('process fail: ', error); 
        }
    })

    return result;
}

module.exports = {
    addPersonalTrainerReceipt
}
