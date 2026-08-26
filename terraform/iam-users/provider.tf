provider "aws" {
  region = "eu-north-1"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=6.57.0"
    }
  }

  backend "s3" {
    bucket       = "masonicapp-terraform-state-stage"
    key          = "state/users/terraform.tfstate"
    use_lockfile = true
    region       = "eu-north-1"
    encrypt      = true
  }
}
