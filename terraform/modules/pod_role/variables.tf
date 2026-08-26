variable "name" {
  description = "Name of the IAM role "
  type        = string
}
variable "tags" {
  description = "List of tags to apply to the IAM role"
  type        = map(string)
  default     = {}
}
variable "aws_managed_policy_arns" {
  description = "List of AWS managed policy ARNs to attach to the IAM role"
  type        = list(string)
  default     = []
}
variable "inline_policies" {
  description = "Map of inline policies to attach to the IAM role"
  type        = map(string)
  default     = {}
}
variable "cluster_name" {
  description = "Cluster name for pod identity"
  type        = string
}
variable "namespace" {
  description = "Namespace for pod identity"
  type        = string
}
variable "service_account_name" {
  description = "Service account name (pod) for pod identity"
  type        = string
}
