locals {
  lambda_source_path = "${path.module}/../../backend"
}

##############################################
# Lambda: getUsers
##############################################
resource "aws_lambda_function" "get_users" {
  function_name = "${var.project_name}-get-users"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = var.lambda_runtime
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  filename         = "${local.lambda_source_path}/getUsers/function.zip"
  source_code_hash = filebase64sha256("${local.lambda_source_path}/getUsers/function.zip")

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }

  tags = {
    Project = var.project_name
    Env     = "dev"
  }
}

##############################################
# Lambda: updateUser (CORRECTA)
##############################################
resource "aws_lambda_function" "update_user" {
  function_name = "${var.project_name}-update-user"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = var.lambda_runtime
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  filename         = "${local.lambda_source_path}/updateUser/function.zip"
  source_code_hash = filebase64sha256("${local.lambda_source_path}/updateUser/function.zip")

  environment {
    variables = {
      USERS_TABLE       = aws_dynamodb_table.users.name
      TABLE_CONNECTIONS = aws_dynamodb_table.ws_connections.name
      WS_ENDPOINT       = aws_apigatewayv2_api.ws_api.api_endpoint
    }
  }

  tags = {
    Project = var.project_name
    Env     = "dev"
  }
}


##############################################
# Lambda: syncEngine
##############################################
resource "aws_lambda_function" "sync_engine" {
  function_name = "${var.project_name}-sync-engine"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = var.lambda_runtime
  timeout       = 20
  memory_size   = 512

  filename         = "${local.lambda_source_path}/syncEngine/function.zip"
  source_code_hash = filebase64sha256("${local.lambda_source_path}/syncEngine/function.zip")

  environment {
  variables = {
    USERS_TABLE       = aws_dynamodb_table.users.name
    TABLE_CONNECTIONS = aws_dynamodb_table.ws_connections.name
    WS_ENDPOINT       = aws_apigatewayv2_api.ws_api.api_endpoint
  }
}


  tags = {
    Project = var.project_name
    Env     = "dev"
  }
}

##############################################
# ❌ BORRADO:
# - Lambda broadcast
# - Lambda onConnect
# - Lambda onDisconnect
##############################################
