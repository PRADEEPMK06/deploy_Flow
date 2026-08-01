import boto3

def provision_user_app(github_repo_url: str):
    # Initialize AWS EC2 client (ensure AWS credentials are set via environment variables on your master EC2)
    ec2_client = boto3.client('ec2', region_name='us-east-1') # Update to your region

    # User Data script that executes automatically inside the newly spawned EC2 instance
    user_data_script = f"""#!/bin/bash
    apt-get update -y
    apt-get install -y git docker.io
    systemctl start docker
    systemctl enable docker

    # Clone user repository
    cd /home/ubuntu
    git clone {github_repo_url} user_app
    cd user_app

    # Build and run based on whether they have a Dockerfile or standard static app
    if [ -f "Dockerfile" ]; then
        docker build -t user-app .
        docker run -d -p 80:80 --restart always user-app
    else
        # Fallback or standard static hosting setup
        echo "Running static app setup..."
    fi
    """

    # Launch a fresh EC2 instance for the user
    response = ec2_client.run_instances(
        ImageId='ami-04b70fa74e45c3917',  # Use a valid Ubuntu AMI ID for your region
        InstanceType='t2.micro',          # Free-tier instance
        MinCount=1,
        MaxCount=1,
        KeyName='your-aws-key-name',     # Your EC2 Key Pair name
        SecurityGroupIds=['sg-xxxxxx'],   # Your EC2 Security Group ID (allowing port 80 and 22)
        UserData=user_data_script,
        TagSpecifications=[
            {
                'ResourceType': 'instance',
                'Tags': [{'Key': 'Name', 'Value': 'DeployFlow-UserApp'}]
            }
        ]
    )

    instance_id = response['Instances'][0]['InstanceId']
    
    # Wait briefly or fetch the public IP of the newly created instance
    # (In production, use a boto3 waiter or describe_instances to get the PublicIpAddress)
    return {"instance_id": instance_id, "status": "Provisioning started"}