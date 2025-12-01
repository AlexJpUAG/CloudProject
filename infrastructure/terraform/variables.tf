variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used to name all project resources"
  type        = string
  default     = "lab-results-mobile"
}

variable "lambda_runtime" {
  description = "Runtime for Lambda functions"
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_timeout" {
  description = "Default timeout (in seconds) for Lambda functions"
  type        = number
  default     = 10
}

variable "lambda_memory" {
  description = "Default memory size (in MB) for Lambda functions"
  type        = number
  default     = 256
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

