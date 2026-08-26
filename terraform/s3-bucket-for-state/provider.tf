terraform {
  required_providers {
    terraform = {
      version = "1.15.9"
    }

    aws = {
      source  = "hashicorp/aws"
      version = ">=6.57.0"
    }
  }

  backend "local" {
    path = "/tmp/terraform.tfstate"
  }
}

provider "aws" {
  region = "eu-north-1"
}
