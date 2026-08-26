resource "aws_s3_bucket" "main" {
  bucket = "masonicapp-terraform-state"

  tags = {
    ManagedBy = "Terraform"
    Name      = "masonicapp-terraform-state"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}
