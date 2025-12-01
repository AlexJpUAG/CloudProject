// backend/sync_engine/index.js

const {
  DynamoDBClient,
  PutItemCommand
} = require("@aws-sdk/client-dynamodb");

const {
  ApiGatewayManagementApi
} = require("@aws-sdk/client-apigatewaymanagementapi");

const client = new DynamoDBClient({ region: "us-east-1" });

const TABLE = process.env.USERS_TABLE;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

const {
  ScanCommand
} = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    const body = JSON.parse(event.body);

    // -----------------------------
    // 1️⃣ Guardar datos en DynamoDB
    // -----------------------------
    const item = {
      userId: { S: body.userId },
      name: { S: body.name },
      email: { S: body.email }
    };

    await client.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: item
      })
    );

    // -----------------------------
    // 2️⃣ Preparar WebSocket Broadcast
    // -----------------------------
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;

    const wsApi = new ApiGatewayManagementApi({
      endpoint: `${domain}/${stage}`
    });

    const connections = await client.send(
      new ScanCommand({
        TableName: CONNECTIONS_TABLE
      })
    );

    const payload = {
      type: "update",
      userId: body.userId,
      name: body.name,
      email: body.email
    };

    const message = Buffer.from(JSON.stringify(payload));

    // -----------------------------
    // 3️⃣ Enviar mensaje a todos los clientes conectados
    // -----------------------------
    const promises = connections.Items.map(async (conn) => {
      const connectionId = conn.connectionId.S;

      try {
        await wsApi.postToConnection({
          ConnectionId: connectionId,
          Data: message
        });
      } catch (err) {
        console.log("WS ERROR:", err);
      }
    });

    await Promise.all(promises);

    // -----------------------------
    // 4️⃣ Respuesta a tu API normal
    // -----------------------------
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Sync completed",
        userId: body.userId
      })
    };

  } catch (err) {
    console.error("SyncEngine ERROR:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "Internal server error"
      })
    };
  }
};
