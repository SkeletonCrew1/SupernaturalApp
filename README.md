# Supernatural

This repository contains secure social network application that consists of several microservices that run inside Docker containers and are orchestrated by Kubernetes and Helm. Our application features:

* Application is protected by a password
* New password is mailed daily to registered users
* Users have different tiers (copper, silver, gold)
* Users are able to log in with their email and password
* Users are assigned randomized aliases (no real names used)
* Reported or banned users are redirected to a different site
* Compromised button that deletes all data in our database
* User promotion is done by voting
* Inquisitor can vote to excommunicade a user
* New users can be invited via email (bypassing website password-protection)
* Some users can send email to masons of selected tier
* Architect and Architect hall of fame
* Architects can promote and demote any user without voting and are changed every 7 days
* Architect is chosen if majority of users vote YES(90%)
* MCP powered by Groq AI

## Services

```text
.
├── auth                  # User authentication service
├── cleanup               # Cleanup service for erase database button
├── docs                  # Documentation folder
├── kubernetes             # Kubernetes manifests + Helm chart
├── frontend              # Web UI service for application
├── general               # General service:
│                             * Django application
│                             * Database
│                             * Database backups
└── mail_sending          # Mail sending service
```

## Prerequisites

* [Terraform](https://developer.hashicorp.com/terraform/install) v1.15.9
* [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2.31.35
* [kubernetes](https://kubernetes.io/docs/tasks/tools/):
  1. Client v1.36.3
  1. Kustomize v5.8.1
  1. Server v.1.36.2
* Cloudflare API key with Zone edit permissions
* Your Domain with configured cloudflare name servers

## Steps to Run

1. Configure AWS credentials `aws config`
1. Deploy terraform resources:
    1. Deploy [iam-users](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/terraform/iam-users)
    1. Deploy [s3-bucket-for-state](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/terraform/s3-bucket-for-state)
    1. Deploy [s3-bucket-for-app](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/terraform/s3-bucket-for-app)
    1. Deploy [ECR](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/terraform/ECR)
        * Configure Github Actions secret and run push to ecr workflow (**1st time only**)
    1. Deploy [EKS/VPC/RDS](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/terraform/eks-cluster)
1. Configure kubectl to work with your EKS cluster
```bash
    aws eks update-kubeconfig --region <region-code> --name  <my-cluster>
    aws sts assume-role --role-arn arn:aws:iam::<ACCOUNT-ID>:role/eks-admin --role-session-name session
    aws eks update-kubeconfig --region eu-north-1 --name eks-cluster --role-arn arn:aws:iam::<ACCOUNT-ID>:role/eks-admin
```
1. Add necessary Secrets to secret manager (Reference secrets.example)
1. Follow [jenkins](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/jenkins) folder instructions to
build the app/consul
1. Configure your domains DNS records to point at NLB created by consul api-gateway
1. Go to your domain and enjoy!
