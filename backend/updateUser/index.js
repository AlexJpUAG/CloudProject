const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");

const db = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(db);

// ⚠️ Variables desde Terraform
const TABLE_USERS = process.env.USERS_TABLE;
const TABLE_CONNECTIONS = process.env.TABLE_CONNECTIONS;
const WS_ENDPOINT = process.env.WS_ENDPOINT;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { userId, name, email } = body;

  // -----------------------------
  // 1️⃣ Guardar en DynamoDB
  // -----------------------------
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_USERS,
      Key: { userId: String(userId) },
      UpdateExpression: "SET #n = :name, #e = :email",
      ExpressionAttributeNames: {
        "#n": "name",
        "#e": "email",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":email": email,
      },
    })
  );

  // -----------------------------
  // 2️⃣ Enviar broadcast por WebSocket
  // -----------------------------
  const apiClient = new ApiGatewayManagementApiClient({
    region: "us-east-1",
    endpoint: WS_ENDPOINT.replace("wss://", "https://"),
  });

  const connections = await docClient.send(
    new ScanCommand({
      TableName: TABLE_CONNECTIONS,
    })
  );

  const message = {
    type: "update",
    userId: String(userId),
    name,
    email,
  };

  await Promise.all(
    connections.Items.map(async (conn) => {
      try {
        await apiClient.send(
          new PostToConnectionCommand({
            ConnectionId: conn.connectionId,
            Data: Buffer.from(JSON.stringify(message)),
          })
        );
      } catch (err) {
        if (err.statusCode === 410) {
          console.log("⚠️ Socket muerto:", conn.connectionId);
        }
      }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};
