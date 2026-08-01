# ==============================================================================
# DeployFlow - Terraform Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project, used for resource naming prefixes"
  type        = string
  default     = "deployflow"
}

variable "environment" {
  description = "Deployment environment (e.g., development, staging, production)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the main VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for public subnet 1"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for public subnet 2"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_1_cidr" {
  description = "CIDR block for private subnet 1"
  type        = string
  default     = "10.0.10.0/24"
}

variable "private_subnet_2_cidr" {
  description = "CIDR block for private subnet 2"
  type        = string
  default     = "10.0.11.0/24"
}

variable "instance_type" {
  description = "EC2 instance type for the DeployFlow server/runner"
  type        = string
  default     = "t3.medium"
}

variable "ssh_public_key" {
  description = "SSH public key for accessing the EC2 instance"
  type        = string
  default     = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG... deployflow-default-key"
}

variable "db_instance_class" {
  description = "RDS instance class for PostgreSQL"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Name of the default PostgreSQL database"
  type        = string
  default     = "deployflow"
}

variable "db_username" {
  description = "Master username for the PostgreSQL database"
  type        = string
  default     = "deployflow_admin"
}

variable "db_password" {
  description = "Master password for the PostgreSQL database"
  type        = string
  sensitive   = true
  default     = "SuperSecureDeployFlowDBPassword123!"
}