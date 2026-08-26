resource "aws_iam_user" "masonicapp" {
  name = "masonic-application-user"
  path = "/"

  tags = {
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_user_policy_attachment" "masonicapp" {
  user = aws_iam_user.masonicapp.id
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_access_key" "masonicapp" {
  user = aws_iam_user.masonicapp.id
}