'use strict';

const DynamoDb = require(`aws-sdk/clients/dynamodb`);
const documentClient = new DynamoDb.DocumentClient({region: process.env.REGION});
const NOTES_TBL_NAME = process.env.NOTES_TBL_NAME;

const send = (statusCode, body) => {
  return {
    statusCode,
    body
  }
}

module.exports.createNote = async (event, context, callBack) => {
  const {id, title, ...body} = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
      Item: {
        notesId: id,
        title,
        body
      },
      ConditionExpression: "attribute_not_exists(notesId)"  
    }
    await documentClient.put(param).promise();
    callBack(null, send(201, event.body));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

module.exports.updateNote = async (event, context, callBack) => {
  const {id, title, ...body} = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TBL_NAME,
      Key: {
        notesId: id
      },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body"
      },
      ExpressionAttributeValues: {
        ":title": title,
        ":body": body
      },
      ConditionExpression: "attribute_exists(notesId)"  
    }
    await documentClient.update(param).promise();
    callBack(null, send(201, event.body));
  }catch(err) {
    return send(500, JSON.stringify(err.message));
  }
};

module.exports.deleteNote = async (event) => {
  const id = event.pathParameters.id;
  return send(200, `Note ${id}, deleted`);
};

module.exports.getAllNotes = async (event) => {
  return send(200, `All notes`);
};
