# ==============================================================================
# DeployFlow - EC2 Instance & Launch Configuration
# ==============================================================================

# Data source to fetch the latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# Key Pair for EC2 SSH access
resource "aws_key_pair" "deployflow_key" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = var.ssh_public_key

  tags = {
    Name        = "${var.project_name}-${var.environment}-key"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# EC2 Instance for DeployFlow Runner / App Server
resource "aws_instance" "deployflow_server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public_subnet_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  key_name             = aws_key_pair.deployflow_key.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.project_name}-${var.environment}-root-volume"
      Environment = var.environment
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common git
              
              # Install Docker
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io
              usermod -aG docker ubuntu
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              echo "DeployFlow EC2 bootstrap completed successfully." > /var/log/deployflow-bootstrap.log
              EOF

  tags = {
    Name        = "${var.project_name}-${var.environment}-server"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Elastic IP allocation for consistent server endpoint
resource "aws_eip" "deployflow_eip" {
  instance = aws_instance.deployflow_server.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-${var.environment}-eip"
    Environment = var.environment
  }
}

# Outputs for EC2 connection details
output "ec2_public_ip" {
  description = "Public Elastic IP address of the DeployFlow server"
  value       = aws_eip.deployflow_eip.public_ip
}

output "ec2_ssh_connection" {
  description = "SSH command to connect to the DeployFlow server"
  value       = "ssh -i <your-private-key.pem> ubuntu@${aws_eip.deployflow_eip.public_ip}"
}