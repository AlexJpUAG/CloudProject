// on_disconnect/index.js
const {
  DynamoDBClient,
  DeleteItemCommand
} = require("@aws-sdk/client-dynamodb");

const db = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const table = process.env.TABLE_CONNECTIONS;

  console.log("🔌 Cliente desconectado:", connectionId);

  if (!table) {
    console.error("❌ ERROR: Falta TABLE_CONNECTIONS");
    return {
      statusCode: 500,
      body: "Missing TABLE_CONNECTIONS"
    };
  }

  try {
    await db.send(
      new DeleteItemCommand({
        TableName: table,
        Key: { connectionId: { S: connectionId } }
      })
    );

    console.log("🗑️ Conexión eliminada:", connectionId);

    return {
      statusCode: 200,
      body: "Disconnected"
    };

  } catch (err) {
    console.error("❌ Error eliminando conexión:", err);

    return {
      statusCode: 500,
      body: "Failed to disconnect: " + err.message
    };
  }
};
