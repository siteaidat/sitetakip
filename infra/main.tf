terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "sitetakip-terraform-state"
    key    = "infra/terraform.tfstate"
    region = "eu-central-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ─── VPC ───────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project_name}-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project_name}-public-b" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"
  tags              = { Name = "${var.project_name}-private-a" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}b"
  tags              = { Name = "${var.project_name}-private-b" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-nat-eip" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = { Name = "${var.project_name}-nat" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-public-rt" }

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-private-rt" }

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

# ─── SECURITY GROUPS ──────────────────────────────────

resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}

resource "aws_security_group" "ecs" {
  name_prefix = "${var.project_name}-ecs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Backend API"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Metabase"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ecs-sg" }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# ─── ECR ──────────────────────────────────────────────

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ─── RDS ──────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = { Name = "${var.project_name}-db-subnet" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16.12"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_encrypted     = true

  db_name  = "sitetakip"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  skip_final_snapshot     = true
  multi_az                = false

  tags = { Name = "${var.project_name}-db" }
}

# ─── ALB ──────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = { Name = "${var.project_name}-alb" }
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-backend-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ─── ACM + HTTPS ─────────────────────────────────────

resource "aws_acm_certificate" "staging_api" {
  domain_name       = "staging-api.site-takip.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "${var.project_name}-staging-api-cert" }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:eu-central-1:034362052544:certificate/bb18af7f-04e2-49eb-ae6e-3aa0b75a47bb"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_acm_certificate_validation" "staging_api" {
  certificate_arn = aws_acm_certificate.staging_api.arn

  timeouts {
    create = "10m"
  }
}

resource "aws_lb_listener_certificate" "staging_api" {
  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = aws_acm_certificate_validation.staging_api.certificate_arn
}

resource "aws_lb_listener_rule" "staging_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_staging.arn
  }

  condition {
    host_header {
      values = ["staging-api.site-takip.com"]
    }
  }
}

# ─── ECS ──────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"

    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "8080" },
      { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/sitetakip?sslmode=require" },
      { name = "JWT_SECRET", value = var.jwt_secret },
      { name = "CORS_ORIGIN", value = var.cors_origin },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.http]
}

# ═══════════════════════════════════════════════════════
# STAGING ENVIRONMENT
# ═══════════════════════════════════════════════════════

# ─── STAGING RDS ─────────────────────────────────────

resource "aws_db_instance" "staging" {
  identifier     = "${var.project_name}-db-staging"
  engine         = "postgres"
  engine_version = "16.12"
  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 30
  storage_encrypted     = true

  db_name  = "sitetakip"
  username = var.db_username
  password = var.db_password_staging

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 1
  skip_final_snapshot     = true
  multi_az                = false

  tags = { Name = "${var.project_name}-db-staging" }
}

# ─── STAGING ECS ─────────────────────────────────────

resource "aws_cloudwatch_log_group" "ecs_staging" {
  name              = "/ecs/${var.project_name}-staging"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "backend_staging" {
  family                   = "${var.project_name}-backend-staging"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"

    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "8080" },
      { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password_staging}@${aws_db_instance.staging.endpoint}/sitetakip?sslmode=require" },
      { name = "JWT_SECRET", value = var.jwt_secret },
      { name = "CORS_ORIGIN", value = var.cors_origin_staging },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_staging.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

resource "aws_lb_target_group" "backend_staging" {
  name        = "${var.project_name}-staging-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}

resource "aws_ecs_service" "backend_staging" {
  name            = "${var.project_name}-backend-staging"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend_staging.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_staging.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.http]
}

# ─── ALB HOST-BASED ROUTING ─────────────────────────

resource "aws_lb_listener_rule" "staging" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_staging.arn
  }

  condition {
    host_header {
      values = ["staging-api.site-takip.com"]
    }
  }
}

# ─── S3 BUCKET FOR DB DUMPS ─────────────────────────

resource "aws_s3_bucket" "db_dumps" {
  bucket = "${var.project_name}-db-dumps"

  tags = { Name = "${var.project_name}-db-dumps" }
}

resource "aws_s3_bucket_lifecycle_configuration" "db_dumps" {
  bucket = aws_s3_bucket.db_dumps.id

  rule {
    id     = "expire-old-dumps"
    status = "Enabled"

    filter {}

    expiration {
      days = 7
    }
  }
}

resource "aws_s3_bucket_public_access_block" "db_dumps" {
  bucket = aws_s3_bucket.db_dumps.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── DAILY DB SYNC (EventBridge + ECS Scheduled Task) ─

resource "aws_ecr_repository" "dbsync" {
  name                 = "${var.project_name}-dbsync"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_security_group" "dbsync" {
  name_prefix = "${var.project_name}-dbsync-"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-dbsync-sg" }
}

# Allow dbsync task to connect to RDS (both prod and staging)
resource "aws_security_group_rule" "rds_from_dbsync" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.dbsync.id
  security_group_id        = aws_security_group.rds.id
}

# IAM role for dbsync task
resource "aws_iam_role" "dbsync_task" {
  name = "${var.project_name}-dbsync-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "dbsync_s3" {
  name = "${var.project_name}-dbsync-s3"
  role = aws_iam_role.dbsync_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ]
      Resource = "${aws_s3_bucket.db_dumps.arn}/*"
    }]
  })
}

resource "aws_cloudwatch_log_group" "dbsync" {
  name              = "/ecs/${var.project_name}-dbsync"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "dbsync" {
  family                   = "${var.project_name}-dbsync"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.dbsync_task.arn

  container_definitions = jsonencode([{
    name  = "dbsync"
    image = "${aws_ecr_repository.dbsync.repository_url}:latest"

    environment = [
      { name = "PROD_DB_HOST", value = aws_db_instance.main.address },
      { name = "PROD_DB_PORT", value = "5432" },
      { name = "PROD_DB_NAME", value = "sitetakip" },
      { name = "PROD_DB_USER", value = var.db_username },
      { name = "PROD_DB_PASS", value = var.db_password },
      { name = "STAGING_DB_HOST", value = aws_db_instance.staging.address },
      { name = "STAGING_DB_PORT", value = "5432" },
      { name = "STAGING_DB_NAME", value = "sitetakip" },
      { name = "STAGING_DB_USER", value = var.db_username },
      { name = "STAGING_DB_PASS", value = var.db_password_staging },
      { name = "S3_BUCKET", value = aws_s3_bucket.db_dumps.id },
      { name = "AWS_DEFAULT_REGION", value = var.aws_region },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.dbsync.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "dbsync"
      }
    }
  }])
}

# EventBridge rule: daily at UTC 22:00 (TR 01:00)
resource "aws_cloudwatch_event_rule" "dbsync_schedule" {
  name                = "${var.project_name}-dbsync-daily"
  description         = "Daily prod→staging DB sync at TR 01:00"
  schedule_expression = "cron(0 22 * * ? *)"
}

# IAM role for EventBridge to run ECS tasks
resource "aws_iam_role" "eventbridge_ecs" {
  name = "${var.project_name}-eventbridge-ecs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_run_task" {
  name = "${var.project_name}-eventbridge-run-task"
  role = aws_iam_role.eventbridge_ecs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ecs:RunTask"
        Resource = aws_ecs_task_definition.dbsync.arn
      },
      {
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = [
          aws_iam_role.ecs_task_execution.arn,
          aws_iam_role.dbsync_task.arn,
        ]
      }
    ]
  })
}

resource "aws_cloudwatch_event_target" "dbsync_ecs" {
  rule      = aws_cloudwatch_event_rule.dbsync_schedule.name
  target_id = "${var.project_name}-dbsync"
  arn       = aws_ecs_cluster.main.arn
  role_arn  = aws_iam_role.eventbridge_ecs.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.dbsync.arn
    launch_type         = "FARGATE"

    network_configuration {
      subnets         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
      security_groups = [aws_security_group.dbsync.id]
    }
  }
}
