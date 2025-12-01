// broadcast/index.js

const {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand
} = require("@aws-sdk/client-dynamodb");

const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} = require("@aws-sdk/client-apigatewaymanagementapi");

const db = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("📩 EVENT:", JSON.stringify(event));

  const table = process.env.TABLE_CONNECTIONS;
  if (!table) {
    console.error("❌ ERROR: Falta variable TABLE_CONNECTIONS");
    return { statusCode: 500, body: "Missing TABLE_CONNECTIONS" };
  }

  let body;

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error("❌ ERROR: Body inválido:", err);
    return { statusCode: 400, body: "Invalid JSON body" };
  }

  const message = JSON.stringify({
    type: "update",
    userId: body.userId,
    name: body.name,
    email: body.email
  });

  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  console.log("🌐 WebSocket endpoint:", endpoint);

  const api = new ApiGatewayManagementApiClient({
    region: "us-east-1",
    endpoint: endpoint
  });

  // Obtener todas las conexiones activas en DynamoDB
  const connections = await db.send(
    new ScanCommand({ TableName: table })
  );

  console.log("🔗 Conexiones encontradas:", connections.Items.length);

  for (const item of connections.Items) {
    const connectionId = item.connectionId.S;

    try {
      await api.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(message)
        })
      );
      console.log("📤 Enviado a:", connectionId);

    } catch (err) {
      // 410 Gone → la conexión ya no existe → eliminar
      if (err.statusCode === 410) {
        console.log("🗑️ Eliminando conexión muerta:", connectionId);

        await db.send(
          new DeleteItemCommand({
            TableName: table,
            Key: { connectionId: { S: connectionId } }
          })
        );
      } else {
        console.error("❌ Error enviando a:", connectionId, err);
      }
    }
  }

  return { statusCode: 200, body: "Broadcast sent" };
};
