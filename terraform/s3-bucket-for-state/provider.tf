terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=6.57.0"
    }
  }

  backend "local"{
    path = "/tmp/terraform.tfstate"
  }
}

provider "aws" {
  region = "eu-north-1"
}