# Creating IAM users using Terraform

This documentation describes how to create IAM users for teammates using Terraform code in AWS.

## Preriqusites
- [Git](https://git-scm.com/install/) v2.53.0
- AWS account
- [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2.31.35
- [Terraform](https://developer.hashicorp.com/terraform/install) v1.15.8

## Folder structure
- `provider.tf` defines the cloud provider and S3 backend.
- `main.tf` creates users and defines policies for them.
- `locals.tf` defines local variables(names of users).
- `outputs.tf` checks the result of this Terraform code.
- `application-iam-user.tf` creates a user and an access key for our application.


## Usage

```bash
# 1. Configure AWS credentials in the terminal.

# 2. Clone the MasonicApp repository.
git clone https://github.com/SkeletonCrew1/SupernaturalApp.git

# Change working directory.
cd ./terraform/s3-bucket-for-state

# Initialize the working directory for Terraform.
terraform init

# Apply changes for creating S3bucket.
terraform apply

# Change working directory.
cd ./terraform/iam-users

# Initialize the working directory for Terraform.
terraform init

# Apply changes for creating IAM users.
terraform apply

# Command to output credentials to a json file
terraform output -json user_passwords > passwords.json
terraform output -json app_access_key > app_access_key.json
```
