const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event) => {
    console.log('event: ', event)
    await Promise.all(event.Records.map(async record => {
        if (record.eventName === 'REMOVE' || record.eventName === 'INSERT') {
            console.log('updating table total...')
            await updateTable(record.eventName)
        }
    }))
    return
};

async function updateTable(actionType) {
  // set by default to increment by 1
  let updateExpression = 'set #total = #total + :updateValue'
  if (actionType === 'REMOVE') {
    // if the action is to remove, then update expression to decrement by 1
    updateExpression = 'set #total = #total - :updateValue'
  }
  var params = {
    TableName: process.env.TABLE_NAME,
    Key: { id: "001" },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: { ':updateValue': 1 },
    ExpressionAttributeNames: { '#total': 'total' }
  }
  try {
    await docClient.update(params).promise()
  } catch (err) {
    console.log('error updating table..', err)
    return err
  }
}
