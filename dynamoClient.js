var AWS = require("aws-sdk");
// Set the AWS Region.
AWS.config.update({ region: "us-east-1" });

// Create DynamoDB service object.
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

module.exports = ddb;