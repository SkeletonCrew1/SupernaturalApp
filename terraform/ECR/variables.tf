variable "region" {
  description = "eu-north-1"
  type        = string
  default     = "eu-north-1"

}

variable "ecr_services" {
  description = "The list of names in ecr registry"
  type        = set(string)
  default = [
    "frontend",
    "general",
    "auth",
    "cleanup",
    "mail_sending",
    "password_generator"
  ]
}
