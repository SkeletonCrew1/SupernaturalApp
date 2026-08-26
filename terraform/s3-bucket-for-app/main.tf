resource "aws_s3_bucket" "app_bucket" {
  bucket = "skeletoncrew-masonicapp-stage-images"

  tags = {
    ManagedBy = "Terraform"
    Name      = "skeletoncrew-masonicapp-stage-images"
  }
}

resource "aws_s3_bucket_versioning" "app_bucket" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}
