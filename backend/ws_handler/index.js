// ws_handler/index.js

const {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand
} = require("@aws-sdk/client-dynamodb");

const {
  ApiGatewayManagementApi
} = require("@aws-sdk/client-apigatewaymanagementapi");

const client = new DynamoDBClient({ region: "us-east-1" });
const TABLE = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  const api = new ApiGatewayManagementApi({
    endpoint: `${domain}/${stage}`,
  });

  console.log("ROUTE:", route);
  console.log("EVENT:", JSON.stringify(event));

  try {

    // 1️⃣ $connect → Guardar conexión
    if (route === "$connect") {
      await client.send(
        new PutItemCommand({
          TableName: TABLE,
          Item: {
            connectionId: { S: connectionId }
          }
        })
      );
      return { statusCode: 200 };
    }

    // 2️⃣ $disconnect → Eliminar conexión
    if (route === "$disconnect") {
      await client.send(
        new DeleteItemCommand({
          TableName: TABLE,
          Key: { connectionId: { S: connectionId } }
        })
      );
      return { statusCode: 200 };
    }

    // 3️⃣ subscribe → no hace nada especial
    if (route === "subscribe") {
      return {
        statusCode: 200,
        body: "Subscribed"
      };
    }

    // 4️⃣ broadcast → enviar a TODOS los usuarios conectados
    if (route === "broadcast") {
      const body = JSON.parse(event.body);

      const allConnections = await client.send(
        new ScanCommand({
          TableName: TABLE
        })
      );

      const msg = {
        type: "update",
        payload: body.payload
      };

      const sendPromises = allConnections.Items.map(async (item) => {
        const id = item.connectionId.S;
        try {
          await api.postToConnection({
            ConnectionId: id,
            Data: Buffer.from(JSON.stringify(msg)),
          });
        } catch (err) {
          console.log("Error sending to connection:", id, err);
        }
      });

      await Promise.all(sendPromises);

      return { statusCode: 200 };
    }

    return { statusCode: 200 };

  } catch (err) {
    console.error("WebSocket ERROR:", err);
    return { statusCode: 500 };
  }
};
