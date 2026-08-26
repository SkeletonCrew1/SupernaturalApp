resource "aws_iam_user" "users" {
  for_each = toset(local.users)

  name = each.value
  path = "/"

  tags = {
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_user_login_profile" "users" {
  for_each = aws_iam_user.users

  user                    = each.value.name
  password_length         = 20
  password_reset_required = true

}

resource "aws_iam_user_policy_attachment" "users-readonly-access" {
  for_each = toset(local.users)

  user       = aws_iam_user.users[each.value].name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_group" "shell-policy-group" {
  name = "shell-policy-group"
}

resource "aws_iam_user_group_membership" "shell-policy-group-attachment" {
  for_each = toset(local.users)
  user     = aws_iam_user.users[each.value].name

  groups = [
    aws_iam_group.shell-policy-group.name,
  ]
}


resource "aws_iam_policy" "shell-policy" {
  name = "shell_policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudShell"
        Effect = "Allow"
        Action = [
          "cloudshell:CreateEnvironment",
          "cloudshell:CreateSession",
          "cloudshell:GetEnvironmentStatus",
          "cloudshell:StartEnvironment",
          "cloudshell:PutCredentials",
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowBasicResources"
        Effect = "Allow"
        Action = [
          "s3:*",
          "ec2:*",
          "eks:*",
          "secretsmanager:*",
          "route53:*",
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "shell-policy-attachment" {
  group      = aws_iam_group.shell-policy-group.name
  policy_arn = aws_iam_policy.shell-policy.arn
}
