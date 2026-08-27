variable "name" {
  description = "Name of the IAM role "
  type        = string
}

variable "tags" {
  description = "List of tags to apply to the IAM role"
  type        = map(string)
  default     = {}
}
