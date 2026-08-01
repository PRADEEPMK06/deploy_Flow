# ==============================================================================
# DeployFlow - Main Terraform Configuration & Provider Setup
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend configuration for remote state management (S3 + DynamoDB locking)
  # Uncomment and configure when deploying to production infrastructure.
  /*
  backend "s3" {
    bucket         = "deployflow-terraform-state-bucket"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "deployflow-terraform-locks"
  }
  */
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Random suffix for globally unique resource naming (e.g. S3 buckets, ECR repositories)
resource "random_id" "suffix" {
  byte_length = 4
}

# Local variables for consistent resource naming conventions
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}