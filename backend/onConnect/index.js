// on_connect/index.js
const {
  DynamoDBClient,
  PutItemCommand
} = require("@aws-sdk/client-dynamodb");

const db = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("🔌 Nueva conexión WebSocket:", event.requestContext.connectionId);

  const connectionId = event.requestContext.connectionId;
  const table = process.env.TABLE_CONNECTIONS;

  if (!table) {
    console.error("❌ ERROR: TABLE_CONNECTIONS no está definido");
    return {
      statusCode: 500,
      body: "Missing TABLE_CONNECTIONS"
    };
  }

  try {
    await db.send(
      new PutItemCommand({
        TableName: table,
        Item: {
          connectionId: { S: connectionId }
        }
      })
    );

    console.log("✅ Conexión guardada:", connectionId);

    return {
      statusCode: 200,
      body: "Connected"
    };

  } catch (err) {
    console.error("❌ Error guardando la conexión:", err);

    return {
      statusCode: 500,
      body: "Failed to connect: " + err.message
    };
  }
};
