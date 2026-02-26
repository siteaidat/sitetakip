variable "aws_region" {
  description = "AWS region"
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  default     = "sitetakip"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  default     = "prod"
}

variable "db_username" {
  description = "RDS master username"
  default     = "sitetakip"
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  sensitive   = true
}

variable "backend_image_tag" {
  description = "Docker image tag for backend"
  default     = "latest"
}

variable "backend_cpu" {
  description = "Fargate task CPU units"
  default     = 256
}

variable "backend_memory" {
  description = "Fargate task memory (MiB)"
  default     = 512
}

variable "db_instance_class" {
  description = "RDS instance class"
  default     = "db.t4g.micro"
}

variable "cors_origin" {
  description = "CORS allowed origin (Vercel URL)"
  default     = "https://sitetakip.vercel.app"
}

variable "db_password_staging" {
  description = "RDS master password for staging"
  sensitive   = true
}

variable "cors_origin_staging" {
  description = "CORS allowed origin for staging frontend"
  default     = "https://staging.sitetakip.vercel.app"
}
