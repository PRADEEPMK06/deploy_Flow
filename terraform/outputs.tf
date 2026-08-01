# ==============================================================================
# DeployFlow - Terraform Outputs
# ==============================================================================

output "vpc_id" {
  description = "ID of the created Virtual Private Cloud (VPC)"
  value       = aws_vpc.deployflow_vpc.id
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets"
  value       = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}

output "private_subnet_ids" {
  description = "List of IDs of the private subnets"
  value       = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
}

output "ecr_repository_url" {
  description = "URL of the Amazon ECR repository for container images"
  value       = aws_ecr_repository.app_repo.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the Amazon ECS cluster"
  value       = aws_ecs_cluster.deployflow_cluster.name
}

output "ec2_server_public_ip" {
  description = "Elastic IP address of the DeployFlow control plane server"
  value       = aws_eip.deployflow_eip.public_ip
}

output "db_instance_endpoint" {
  description = "Connection endpoint for the RDS PostgreSQL database instance"
  value       = aws_db_instance.postgres.endpoint
}