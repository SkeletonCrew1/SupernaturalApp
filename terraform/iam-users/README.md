# Creating IAM users using Terraform

This documentation describes how to create IAM users for teammates using Terraform code in AWS.

## Preriqusites
- Git
- Terraform
- AWS account

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
git clone https://github.com/SkeletonCrew1/MasonicApp.git

# Change the branch.
git checkout SKEL-2-68-create-iam-users

# Change working directory.
cd MasonicApp/terraform/s3-bucket-for-state

# Initialize the working directory for Terraform.
terraform init

# Apply changes for creating S3bucket.
terraform apply

# Change working directory.
cd MasonicApp/terraform/iam-users

# Initialize the working directory for Terraform.
terraform init

# Apply changes for creating IAM users.
terraform apply

# Command to output credentials to a json file
terraform output -json user_passwords > passwords.json
terraform output -json app_access_key > app_access_key.json
```