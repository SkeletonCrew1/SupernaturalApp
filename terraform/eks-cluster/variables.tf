variable "storage_type" {
  description = "Database user"
  type        = string
  default     = "gp3"
}
variable "allocated_storage" {
  description = "Allocate storage in db"
  type        = number
  default     = 20
}

variable "identifier" {
  description = "Unique name of db in aws"
  type        = string
  default     = "supernaturaldb"
}

variable "engine" {
  description = "engine of db"
  type        = string
  default     = "postgres"
}
variable "engine_version" {
  description = "DB engine version"
  type        = string
  default     = "17"
}

variable "instance_type" {
  description = "Instance type"
  type        = string
  default     = "db.t4g.micro"
}

variable "publicly_accessible" {
  type    = bool
  default = false
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
