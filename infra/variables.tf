################################################################################
# General
################################################################################

variable "project_name" {
  description = "Name used to prefix all resources"
  type        = string
  default     = "ship-it"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

################################################################################
# ECS Task sizing
################################################################################

variable "task_cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB"
  type        = number
  default     = 512
}

################################################################################
# Application config (non-secret values)
################################################################################

variable "github_owner" {
  description = "GitHub owner or organization"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "default_branch" {
  description = "Default git branch"
  type        = string
  default     = "main"
}

variable "anthropic_model" {
  description = "Anthropic model ID to use"
  type        = string
  default     = "claude-sonnet-4-5-20250514"
}

################################################################################
# CloudWatch
################################################################################

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}
