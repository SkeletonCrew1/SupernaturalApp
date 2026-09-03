variable "ecr_services" {
  description = "The list of names in ecr registry"
  type        = set(string)
  default = [
    "frontend",
    "general",
    "auth",
    "cleanup",
    "mail_sending",
  "password_generator"]
}

variable "image_mutability" {
  description = "Provide image mutability"
  type        = string
  default     = "IMMUTABLE"
}
variable "encrypt_type" {
  description = "Provide encryption type"
  type        = string
  default     = "AES256"
}

variable "common_tags" {
  description = "general tags for each repo"
  type        = map(string)
  default = {
    ManagedBy = "terrafrom"
  }
}
