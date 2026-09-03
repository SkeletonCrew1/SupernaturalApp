provider "aws" {
  region = var.region
}

terraform {

  required_version = ">=1.15.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.57.0"
    }

  }
  backend "s3" {
    bucket       = "ecr-for-supernatural-terraform-state"
    key          = "state/ECR/terraform.tfstate"
    use_lockfile = true
    region       = "eu-north-1"
    encrypt      = true
  }
}
