resource "aws_ecr_lifecycle_policy" "services" {
  for_each = var.ecr_services

  repository = aws_ecr_repository.services[each.value].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Delete test images older than 3 days"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["test_*"]
          countType      = "sinceImagePushed"
          countUnit      = "days"
          countNumber    = 3
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete dev images older than 14 days"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["dev_*"]
          countType      = "sinceImagePushed"
          countUnit      = "days"
          countNumber    = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
