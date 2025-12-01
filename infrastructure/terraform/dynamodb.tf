resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  # Opcional: índice secundario para búsquedas
  # global_secondary_index {
  #   name            = "email-index"
  #   hash_key        = "email"
  #   projection_type = "ALL"
  # }

  tags = {
    Project = var.project_name
    Env     = "dev"
  }
}
