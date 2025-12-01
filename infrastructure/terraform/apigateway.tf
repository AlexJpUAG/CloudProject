#############################################
# REST API
#############################################
resource "aws_api_gateway_rest_api" "lab_api" {
  name        = "${var.project_name}-api"
  description = "REST API for mobile lab results sync (Scenario E)"
}

#############################################
# RESOURCES
#############################################
resource "aws_api_gateway_resource" "users_resource" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  parent_id   = aws_api_gateway_rest_api.lab_api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "update_resource" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  parent_id   = aws_api_gateway_rest_api.lab_api.root_resource_id
  path_part   = "update"
}

resource "aws_api_gateway_resource" "sync_resource" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  parent_id   = aws_api_gateway_rest_api.lab_api.root_resource_id
  path_part   = "sync"
}

#############################################
# GET /users  (Lambda Proxy)
#############################################
resource "aws_api_gateway_method" "get_users_method" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.users_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_users_integration" {
  rest_api_id             = aws_api_gateway_rest_api.lab_api.id
  resource_id             = aws_api_gateway_resource.users_resource.id
  http_method             = aws_api_gateway_method.get_users_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.get_users.invoke_arn
}

#############################################
# POST /update  (Lambda Proxy)
#############################################
resource "aws_api_gateway_method" "update_user_method" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.update_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "update_user_integration" {
  rest_api_id             = aws_api_gateway_rest_api.lab_api.id
  resource_id             = aws_api_gateway_resource.update_resource.id
  http_method             = aws_api_gateway_method.update_user_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.update_user.invoke_arn
}

#############################################
# POST /sync  (Lambda Proxy)
#############################################
resource "aws_api_gateway_method" "sync_method" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.sync_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "sync_integration" {
  rest_api_id             = aws_api_gateway_rest_api.lab_api.id
  resource_id             = aws_api_gateway_resource.sync_resource.id
  http_method             = aws_api_gateway_method.sync_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.sync_engine.invoke_arn
}

#############################################
# OPTIONS /users (CORS)
#############################################
resource "aws_api_gateway_method" "users_options" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.users_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "users_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.users_resource.id
  http_method = aws_api_gateway_method.users_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "users_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.users_resource.id
  http_method = aws_api_gateway_method.users_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "users_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.users_resource.id
  http_method = aws_api_gateway_method.users_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

#############################################
# OPTIONS /update (CORS)
#############################################
resource "aws_api_gateway_method" "update_options" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.update_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "update_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.update_resource.id
  http_method = aws_api_gateway_method.update_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "update_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.update_resource.id
  http_method = aws_api_gateway_method.update_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "update_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.update_resource.id
  http_method = aws_api_gateway_method.update_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

#############################################
# OPTIONS /sync (CORS)
#############################################
resource "aws_api_gateway_method" "sync_options" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  resource_id   = aws_api_gateway_resource.sync_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "sync_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.sync_resource.id
  http_method = aws_api_gateway_method.sync_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "sync_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.sync_resource.id
  http_method = aws_api_gateway_method.sync_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "sync_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id
  resource_id = aws_api_gateway_resource.sync_resource.id
  http_method = aws_api_gateway_method.sync_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

#############################################
# GLOBAL CORS RESPONSES
#############################################
resource "aws_api_gateway_gateway_response" "cors_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
}

resource "aws_api_gateway_gateway_response" "cors_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
}

#############################################
# PERMISSIONS
#############################################
resource "aws_lambda_permission" "apigw_invoke_get_users" {
  statement_id  = "AllowAPIGatewayInvokeGetUsers"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lab_api.execution_arn}/*/GET/users"
}

resource "aws_lambda_permission" "apigw_invoke_update_user" {
  statement_id  = "AllowAPIGatewayInvokeUpdateUser"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lab_api.execution_arn}/*/POST/update"
}

resource "aws_lambda_permission" "apigw_invoke_sync" {
  statement_id  = "AllowAPIGatewayInvokeSync"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sync_engine.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lab_api.execution_arn}/*/POST/sync"
}

#############################################
# DEPLOYMENT (CORREGIDO)
#############################################
resource "aws_api_gateway_deployment" "lab_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.lab_api.id

  # ❗ NO USAR stage_name AQUÍ
  triggers = {
    redeploy = timestamp()
  }

  depends_on = [
    aws_api_gateway_integration.get_users_integration,
    aws_api_gateway_integration.update_user_integration,
    aws_api_gateway_integration.sync_integration,

    aws_api_gateway_integration.users_options_integration,
    aws_api_gateway_integration.update_options_integration,
    aws_api_gateway_integration.sync_options_integration,

    aws_api_gateway_gateway_response.cors_4xx,
    aws_api_gateway_gateway_response.cors_5xx
  ]
}

#############################################
# STAGE (CORRECTO)
#############################################
resource "aws_api_gateway_stage" "lab_api_stage" {
  rest_api_id   = aws_api_gateway_rest_api.lab_api.id
  deployment_id = aws_api_gateway_deployment.lab_api_deployment.id
  stage_name    = "dev"

  lifecycle {
    ignore_changes = [deployment_id]
  }
}
