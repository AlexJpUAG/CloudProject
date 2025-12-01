output "api_invoke_url" {
  description = "Invoke URL for API Gateway"
  value       = aws_api_gateway_stage.lab_api_stage.invoke_url
}

output "users_table_name" {
  description = "DynamoDB users table"
  value       = aws_dynamodb_table.users.name
}

output "get_users_lambda" {
  value = aws_lambda_function.get_users.arn
}

output "update_user_lambda" {
  value = aws_lambda_function.update_user.arn
}

output "sync_engine_lambda" {
  value = aws_lambda_function.sync_engine.arn
}
