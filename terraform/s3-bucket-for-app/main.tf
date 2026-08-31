resource "aws_s3_bucket" "app_bucket" {
  bucket = "developer-bucket-images-984546305184-eu-north-1"

  tags = {
    ManagedBy = "Terraform"
    Name      = "developer-bucket-images-984546305184-eu-north-1"
  }
}

resource "aws_s3_bucket_versioning" "app_bucket" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}
