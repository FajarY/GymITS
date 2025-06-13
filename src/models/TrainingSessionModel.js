const db = require('../database');

async function createTrainingSession(customerId, startTime)
{
    const [ts_id] = await db.customer('training_session').insert({
        ts_start_time: startTime,
        c_id: customerId
    }).returning('ts_id');

    return ts_id;
}

async function getTrainingSessionIdList(customerId)
{
    const arr = await db.customer('training_session').select(
        'ts_id as id'
    ).where({c_id: customerId});

    return arr;
}

async function getTrainingSessionDataSafe(trainingSessionId, customerId)
{
    const [trainingSession] = await db.customer('training_session').select(
        'ts_id as id', 'ts_start_time as start_time', 'ts_end_time as end_time', 'c_id' 
    ).where({ts_id: trainingSessionId, c_id: customerId});

    return trainingSession;
}

async function endTrainingSessionSafe(customerId, trainingSessionId, endTime)
{
    const [trainingSession] = await db.customer('training_session').where({ts_id: trainingSessionId, c_id: customerId}).update(
        {
            ts_end_time: endTime
        }, ['ts_id', 'ts_start_time', 'ts_end_time']
    );

    return trainingSession;
}

module.exports = 
{
    createTrainingSession,
    getTrainingSessionIdList,
    getTrainingSessionDataSafe,
    endTrainingSessionSafe
}