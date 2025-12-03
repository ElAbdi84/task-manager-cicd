#!/bin/bash

# Script pour créer les repositories ECR pour TaskManager
# Usage: ./setup-ecr.sh

set -e

AWS_REGION="us-east-1"
FRONTEND_REPO="taskmanager-frontend"
BACKEND_REPO="taskmanager-backend"

echo "🚀 Setting up ECR repositories..."
echo ""

# Function to create ECR repository
create_ecr_repo() {
    local repo_name=$1
    
    echo "📦 Creating repository: $repo_name"
    
    # Check if repository already exists
    if aws ecr describe-repositories --repository-names $repo_name --region $AWS_REGION &> /dev/null; then
        echo "✅ Repository $repo_name already exists"
    else
        # Create repository
        aws ecr create-repository \
            --repository-name $repo_name \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256 \
            --tags Key=Environment,Value=Production Key=Project,Value=TaskManager
        
        echo "✅ Repository $repo_name created"
    fi
    
    # Set lifecycle policy to keep only last 10 images
    echo "⚙️  Setting lifecycle policy for $repo_name..."
    aws ecr put-lifecycle-policy \
        --repository-name $repo_name \
        --region $AWS_REGION \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "description": "Keep last 10 images",
                    "selection": {
                        "tagStatus": "any",
                        "countType": "imageCountMoreThan",
                        "countNumber": 10
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }'
    
    echo ""
}

# Create repositories
create_ecr_repo $FRONTEND_REPO
create_ecr_repo $BACKEND_REPO

# Get repository URIs
echo "📋 Repository Information:"
echo "=========================="
echo ""

FRONTEND_URI=$(aws ecr describe-repositories \
    --repository-names $FRONTEND_REPO \
    --region $AWS_REGION \
    --query 'repositories[0].repositoryUri' \
    --output text)

BACKEND_URI=$(aws ecr describe-repositories \
    --repository-names $BACKEND_REPO \
    --region $AWS_REGION \
    --query 'repositories[0].repositoryUri' \
    --output text)

echo "Frontend: $FRONTEND_URI"
echo "Backend: $BACKEND_URI"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "✅ ECR Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add this secret to GitHub:"
echo "   AWS_ACCOUNT_ID = $AWS_ACCOUNT_ID"
echo ""
echo "2. Ensure your IAM user has these permissions:"
echo "   - ecr:GetAuthorizationToken"
echo "   - ecr:BatchCheckLayerAvailability"
echo "   - ecr:GetDownloadUrlForLayer"
echo "   - ecr:BatchGetImage"
echo "   - ecr:PutImage"
echo "   - ecr:InitiateLayerUpload"
echo "   - ecr:UploadLayerPart"
echo "   - ecr:CompleteLayerUpload"
echo ""
echo "3. Install Docker on your EC2 instances:"
echo "   Frontend: ssh ec2-user@<FRONTEND_IP> 'sudo yum install -y docker && sudo systemctl start docker && sudo usermod -aG docker ec2-user'"
echo "   Backend: (via Frontend bastion)"