const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const TABLE = process.env.USERS_TABLE;

exports.handler = async () => {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: TABLE
      })
    );

    const items = (result.Items || []).map(item => ({
      userId: item.userId.S,
      name: item.name.S,
      email: item.email.S
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify(items)
    };
  } catch (err) {
    console.error("ERROR in getUsers:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
