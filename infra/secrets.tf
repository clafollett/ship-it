################################################################################
# SSM Parameters for application secrets
#
# Populate these after first apply:
#   aws ssm put-parameter --name "/ship-it/anthropic-api-key" \
#     --value "sk-ant-..." --type SecureString --overwrite
#
# SSM Parameter Store Standard tier is FREE.
################################################################################

resource "aws_ssm_parameter" "anthropic_api_key" {
  name  = "/${var.project_name}/anthropic-api-key"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = { Project = var.project_name }
}

resource "aws_ssm_parameter" "slack_bot_token" {
  name  = "/${var.project_name}/slack-bot-token"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = { Project = var.project_name }
}

resource "aws_ssm_parameter" "slack_app_token" {
  name  = "/${var.project_name}/slack-app-token"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = { Project = var.project_name }
}

resource "aws_ssm_parameter" "slack_signing_secret" {
  name  = "/${var.project_name}/slack-signing-secret"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = { Project = var.project_name }
}

resource "aws_ssm_parameter" "github_token" {
  name  = "/${var.project_name}/github-token"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = { Project = var.project_name }
}
