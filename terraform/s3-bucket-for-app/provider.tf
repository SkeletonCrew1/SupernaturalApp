provider "aws" {
  region = "eu-north-1"
}

terraform {
  required_providers {
    terraform = {
      version = "1.15.9"
    }

    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.57.0"
    }
  }

  backend "s3" {
    bucket       = "masonicapp-terraform-state-stage"
    key          = "state/app-s3/terraform.tfstate"
    use_lockfile = true
    region       = "eu-north-1"
    encrypt      = true
  }
}
