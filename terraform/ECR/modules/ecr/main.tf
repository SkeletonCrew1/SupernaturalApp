terraform {
  required_version = ">=1.15.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.58"
    }
  }
}

resource "aws_ecr_repository" "services" {
  for_each             = var.ecr_services
  name                 = each.key
  image_tag_mutability = var.image_mutability
  encryption_configuration {
    encryption_type = var.encrypt_type
  }
  tags = merge(
    var.common_tags,
    {
      Service = each.value
    }
  )

}
