from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
import os
import random

app = FastAPI(title="DeployFlow Cloud Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AWS EC2 Client (Reads AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY from environment/GitHub Secrets)
AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
ec2_client = boto3.client('ec2', region_name=AWS_REGION)

class DeployRequest(BaseModel):
    repo_url: str
    branch: str = "main"

# In-memory storage for active cloud deployments (can be swapped for a database later)
active_cloud_deployments = []

@app.post("/api/deploy-live")
def deploy_to_ec2(req: DeployRequest):
    try:
        app_id = f"deployflow-{random.randint(1000, 9999)}"
        
        # Cloud-init user script to auto-clone repository and run a web server on boot
        user_data_script = f"""#!/bin/bash
yum update -y
yum install -y git docker
systemctl start docker
systemctl enable docker
git clone -b {req.branch} {req.repo_url} /app-code
cd /app-code || cd /
# Simple fallback web server if no Dockerfile exists
nohup python3 -m http.server 80 > /var/log/server.log 2>&1 &
"""

        # Launch a real AWS EC2 Instance (t2.micro - Free Tier eligible)
        # Note: Ensure you replace ImageId with a valid AMI for your region (e.g., Amazon Linux 2023)
        instances = ec2_client.run_instances(
            ImageId=os.getenv("AWS_AMI_ID", "ami-022e1a32d3f7426f1"), 
            InstanceType='t2.micro',
            MinCount=1,
            MaxCount=1,
            TagSpecifications=[
                {
                    'ResourceType': 'instance',
                    'Tags': [{'Key': 'Name', 'Value': app_id}]
                },
            ],
            UserData=user_data_script
        )

        instance_id = instances['Instances'][0]['InstanceId']

        # Wait briefly for AWS to assign networking or fetch public IP metadata
        # In production, use a background worker or describe_instances call
        public_url = f"http://Pending-Allocation..."

        deployment_record = {
            "id": app_id,
            "instance_id": instance_id,
            "repo_url": req.repo_url,
            "status": "Provisioning EC2...",
            "public_url": public_url
        }

        active_cloud_deployments.insert(0, deployment_record)
        return deployment_record

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AWS EC2 Provisioning failed: {str(e)}")

@app.get("/api/active-deployments")
def get_active_deployments():
    # Refresh public IPs dynamically from AWS for accuracy
    if active_cloud_deployments:
        try:
            instance_ids = [d["instance_id"] for d in active_cloud_deployments]
            response = ec2_client.describe_instances(InstanceIds=instance_ids)
            for reservation in response.get('Reservations', []):
                for inst in reservation.get('Instances', []):
                    i_id = inst['InstanceId']
                    state = inst['State']['Name']
                    pub_ip = inst.get('PublicIpAddress', '')
                    
                    for d in active_cloud_deployments:
                        if d["instance_id"] == i_id:
                            d["status"] = state.capitalize()
                            if pub_ip:
                                d["public_url"] = f"http://{pub_ip}"
        except Exception:
            pass
            
    return active_cloud_deployments

@app.delete("/api/deploy-live/{instance_id}")
def terminate_ec2_deployment(instance_id: str):
    try:
        # Terminate (delete) the specific AWS EC2 instance
        ec2_client.terminate_instances(InstanceIds=[instance_id])
        
        global active_cloud_deployments
        active_cloud_deployments = [d for d in active_cloud_deployments if d["instance_id"] != instance_id]
        
        return {"status": "success", "message": f"EC2 instance {instance_id} terminated and deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to terminate instance: {str(e)}")