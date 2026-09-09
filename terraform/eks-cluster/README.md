# Creating an EKS cluster using Terraform

This documentation describes how to create an EKS cluster and manage policies using Terraform.

## Preriqusites

- [Git](https://git-scm.com/install/) v2.53.0
- AWS account
- [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2.31.35
- [Terraform](https://developer.hashicorp.com/terraform/install) v1.15.9

## Folder structure
- `provider.tf` defines the cloud provider and backend.
- `locals.tf` defines local variables.
- `vpc.tf` defines the private network.
- `subnets.tf` defines two private and two public subnets.
- `routes.tf` defines routes for subnets.
- `igw.tf` defines an internet gateway for public subnets.
- `nat.tf` defines a NAT for private subnets.
- `eks.tf` defines an EKS cluster.
- `nodes.tf` defines nodes configuration.
- `eks-admin-role.tf` defines an admin role for managing the EKS cluster.
- `aws-lb-controller.tf` sets up AWS Load Balancer Controller.
- `secrets-csi-driver.f` sets up secrets manager driver for our EKS cluster.
- `monitoring.tf` sets up Prometheus and Grafana monitoring stack and pushes Grafana password to AWS Secrets Manager.
- `argocd.tf` sets up ArgoCD for our EKS cluster and pushes ArgoCD password to AWS Secrets Manager.
- `jenkins.tf` sets up Jenkins for our EKS cluster and pushes Jenkins to AWS Secrets Manager.
- `data.tf` contains necessary data type resources
- `https_secret.tf` contains secret necessary for configuring TLS

## Usage

```bash
1. Configure AWS credentials `aws config`
1. Clone the SupernaturalApp repository
1. Change working directory to MasonicApp/terraform/eks-cluster/
1. Run terraform init
1. Run terraform apply
1. Run the following commands and paste the AWS user ID there.
aws eks update-kubeconfig --region eu-north-1 --name eks-cluster
aws sts assume-role --role-arn arn:aws:iam::<ACCOUNT-ID>:role/eks-admin --role-session-name session
aws eks update-kubeconfig --region eu-north-1 --name eks-cluster --role-arn arn:aws:iam::<ACCOUNT-ID>:role/eks-admin
```

## Additional
Jenkins, ArgoCD and Grafana passwords are stored in AWS Secrets Manager.
To expose Grafana use: `kubectl port-forward svc/grafana -n monitoring <Your-port>:80`
To expose ArgoCD use: `kubectl port-forward svc/argocd-server -n argocd <Your-port>:443`
To expose Jenkins use: `kubectl --namespace jenkins port-forward svc/jenkins <Your-port>:8080`

To start our application:
1. Follow the [jenkins](https://github.com/SkeletonCrew1/SupernaturalApp/tree/main/jenkins) folder instructions.

To delete our application:
1. Expose ArgoCD server.
1. Log into ArgoCD.
1. Find application, press on delete, confirm and wait for deletion.

### Important note: before killing clustrer with `terraform destroy`, kill application first using ArgoCD
