provider "aws" {
  region = local.region
}

terraform {
  required_providers {
    terraform = {
      version = "1.15.9"
    }

    tls = {
      source = "hashicorp/tls"
      version = ">=4.3.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.57.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 3.2.1"
    }

    helm = {
      source  = "hashicorp/helm"
      version = ">= 3.2.0"
    }
  }

  backend "s3" {
    bucket       = "masonicapp-terraform-state-stage"
    key          = "state/eks-cluster/terraform.tfstate"
    use_lockfile = true
    region       = "eu-north-1"
    encrypt      = true
  }
}

data "aws_eks_cluster" "eks" {
  name = aws_eks_cluster.eks.name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.eks.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks.certificate_authority[0].data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", aws_eks_cluster.eks.name]
  }
}

provider "helm" {
  kubernetes = {
    host                   = data.aws_eks_cluster.eks.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks.certificate_authority[0].data)

    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", aws_eks_cluster.eks.name]
    }
  }
}
