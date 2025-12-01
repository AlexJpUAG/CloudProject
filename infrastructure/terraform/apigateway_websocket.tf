#############################
# WebSocket Lambda
#############################

resource "aws_lambda_function" "ws_handler" {
  function_name = "${var.project_name}-ws-handler" # lab-results-mobile-ws-handler
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  # RUTA CORRECTA SEGÚN TU PROYECTO
  filename         = "${path.module}/../../backend/ws_handler/function.zip"
  source_code_hash = filebase64sha256("${path.module}/../../backend/ws_handler/function.zip")

  environment {
    variables = {
      CONNECTIONS_TABLE = aws_dynamodb_table.ws_connections.name
    }
  }
}

#############################
# IAM policy para WebSocket Lambda
#############################

resource "aws_iam_policy" "lambda_ws_policy" {
  name        = "${var.project_name}-lambda-ws-policy"
  description = "Permisos para Lambda WebSocket (DynamoDB + postToConnection)"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.ws_connections.arn
      },
      {
        Effect = "Allow"
        Action = [
          "execute-api:ManageConnections"
        ]
        Resource = "arn:aws:execute-api:us-east-1:${data.aws_caller_identity.current.account_id}:*/@connections/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_ws_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_ws_policy.arn
}

data "aws_caller_identity" "current" {}

#############################
# WebSocket API (API Gateway v2)
#############################

resource "aws_apigatewayv2_api" "ws_api" {
  name                       = "${var.project_name}-ws-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

# Integración Lambda
resource "aws_apigatewayv2_integration" "ws_integration" {
  api_id           = aws_apigatewayv2_api.ws_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.ws_handler.invoke_arn
}

#############################
# Rutas
#############################

# $connect
resource "aws_apigatewayv2_route" "ws_connect" {
  api_id    = aws_apigatewayv2_api.ws_api.id
  route_key = "$connect"

  target = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}

# $disconnect
resource "aws_apigatewayv2_route" "ws_disconnect" {
  api_id    = aws_apigatewayv2_api.ws_api.id
  route_key = "$disconnect"

  target = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}

# subscribe
resource "aws_apigatewayv2_route" "ws_subscribe" {
  api_id    = aws_apigatewayv2_api.ws_api.id
  route_key = "subscribe"

  target = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}

# broadcast
resource "aws_apigatewayv2_route" "ws_broadcast" {
  api_id    = aws_apigatewayv2_api.ws_api.id
  route_key = "broadcast"

  target = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}

#############################
# Stage
#############################

resource "aws_apigatewayv2_stage" "ws_stage" {
  api_id      = aws_apigatewayv2_api.ws_api.id
  name        = "dev"
  auto_deploy = true
}

#############################
# Permisos Lambda ← API Gateway
#############################

resource "aws_lambda_permission" "ws_apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvokeWS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ws_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ws_api.execution_arn}/*"
}

#############################
# Output URL del WebSocket
#############################

output "websocket_url" {
  value       = aws_apigatewayv2_api.ws_api.api_endpoint
  description = "WSS base URL. Úsala en el front como WS_URL + '/dev'"
}
