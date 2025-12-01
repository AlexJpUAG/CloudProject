resource "aws_dynamodb_table" "ws_connections" {
  name         = "${var.project_name}-ws-connections"
  billing_mode = "PAY_PER_REQUEST"

  # Primary Key
  hash_key = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }

  tags = {
    Project = var.project_name
    Service = "websocket"
    Env     = var.environment
  }
}
