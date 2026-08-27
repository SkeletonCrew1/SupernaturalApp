module "ecr_repositories" {
  source           = "../modules/ecr"
  image_mutability = "IMMUTABLE"
  encrypt_type     = "AES256"
  ecr_services     = var.ecr_services
}
