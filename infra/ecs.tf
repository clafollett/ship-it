################################################################################
# ECR Repository
################################################################################

resource "aws_ecr_repository" "app" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = var.project_name
  }
}

# Keep only the last 5 images to save storage costs
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

################################################################################
# ECS Cluster (Fargate Spot for cost savings)
################################################################################

resource "aws_ecs_cluster" "main" {
  name = var.project_name

  setting {
    name  = "containerInsights"
    value = "disabled" # Enable if you want deeper metrics (adds cost)
  }

  tags = {
    Name = var.project_name
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 1
    base              = 1
  }
}

################################################################################
# ECS Task Definition
################################################################################

resource "aws_ecs_task_definition" "app" {
  family                   = var.project_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = var.project_name
    image     = "${aws_ecr_repository.app.repository_url}:latest"
    essential = true

    environment = [
      { name = "GITHUB_OWNER", value = var.github_owner },
      { name = "GITHUB_REPO", value = var.github_repo },
      { name = "DEFAULT_BRANCH", value = var.default_branch },
      { name = "WORKING_DIRECTORY", value = "/tmp/workspace" },
      { name = "ANTHROPIC_MODEL", value = var.anthropic_model },
    ]

    secrets = [
      { name = "ANTHROPIC_API_KEY", valueFrom = aws_ssm_parameter.anthropic_api_key.arn },
      { name = "SLACK_BOT_TOKEN", valueFrom = aws_ssm_parameter.slack_bot_token.arn },
      { name = "SLACK_APP_TOKEN", valueFrom = aws_ssm_parameter.slack_app_token.arn },
      { name = "SLACK_SIGNING_SECRET", valueFrom = aws_ssm_parameter.slack_signing_secret.arn },
      { name = "GITHUB_TOKEN", valueFrom = aws_ssm_parameter.github_token.arn },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "node -e 'process.exit(0)'"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = {
    Name = var.project_name
  }
}

################################################################################
# ECS Service
################################################################################

resource "aws_ecs_service" "app" {
  name            = var.project_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1 # Single instance — Socket Mode doesn't need multiple

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 2
    base              = 1
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_task.id]
    assign_public_ip = true # Required for public subnet without NAT Gateway
  }

  # Restart automatically if the task dies
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  # Allow the new deployment to stabilize
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Name = var.project_name
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_execution_base]
}
