resource "aws_iam_role" "eks" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name = "eks-cluster-role"
  }
}

resource "aws_iam_role_policy_attachment" "eks" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks.name
}

resource "aws_eks_cluster" "eks" {
  name     = local.eks_name
  role_arn = aws_iam_role.eks.arn
  version  = local.eks_version

  access_config {
    authentication_mode                         = "API"
    bootstrap_cluster_creator_admin_permissions = true
  }

  vpc_config {
    endpoint_private_access = false
    endpoint_public_access  = true

    subnet_ids = [
      aws_subnet.private_zone1.id,
      aws_subnet.private_zone2.id
    ]
  }

  depends_on = [aws_iam_role_policy_attachment.eks]
}

module "consul-role" {
  source               = "../modules/pod_role"
  name                 = "consul-role"
  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "kube-system"
  service_account_name = "aws-load-balancer-controller"
  aws_managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSLoadBalancingPolicy",
  ]
}

module "frontend-pod-role" {
  source               = "../modules/pod_role"
  name                 = "frontend-pod-role"
  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "frontend"

  inline_policies = {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "S3",
          "Effect" : "Allow",
          "Action" : [
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:PutObject"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]
    })
  }
}
module "general-pod-role" {
  source               = "../modules/pod_role"
  name                 = "general-pod-role"
  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "general"

  inline_policies = {
    policy = jsonencode({

      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "SecretManagerRead",
          "Effect" : "Allow",
          "Action" : [
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetSecretValue",
            "secretsmanager:BatchGetSecretValue"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "RDS",
          "Effect" : "Allow",
          "Action" : [
            "rds-data:BatchExecuteStatement",
            "rds-data:ExecuteSql",
            "rds-data:ExecuteStatement",
            "rds-data:RollbackTransaction",
            "rds-data:BeginTransaction",
            "rds-data:CommitTransaction",
            "rds-db:connect"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "S3",
          "Effect" : "Allow",
          "Action" : [
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:PutObject"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]

    })
  }
}
module "mail-service-pod-role" {
  source               = "../modules/pod_role"
  name                 = "mail-service-pod-role"
  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "mail-service"
  inline_policies = {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "SecretManagerRead",
          "Effect" : "Allow",
          "Action" : [
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetSecretValue",
            "secretsmanager:BatchGetSecretValue"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "RDS",
          "Effect" : "Allow",
          "Action" : [
            "rds-data:BatchExecuteStatement",
            "rds-data:ExecuteSql",
            "rds-data:ExecuteStatement",
            "rds-data:RollbackTransaction",
            "rds-data:BeginTransaction",
            "rds-data:CommitTransaction",
            "rds-db:connect"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]
    })

  }

}
module "auth-pod-role" {
  source = "../modules/pod_role"
  name   = "auth-pod-role"

  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "auth"
  inline_policies = {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "SecretManagerRead",
          "Effect" : "Allow",
          "Action" : [
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetSecretValue",
            "secretsmanager:BatchGetSecretValue"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "RDS",
          "Effect" : "Allow",
          "Action" : [
            "rds-data:BatchExecuteStatement",
            "rds-data:ExecuteSql",
            "rds-data:ExecuteStatement",
            "rds-data:RollbackTransaction",
            "rds-data:BeginTransaction",
            "rds-data:CommitTransaction",
            "rds-db:connect"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]
    })

  }

}
module "cleanup-pod-role" {
  source = "../modules/pod_role"
  name   = "cleanup-pod-role"

  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "cleanup"
  inline_policies = {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "SecretManagerRead",
          "Effect" : "Allow",
          "Action" : [
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetSecretValue",
            "secretsmanager:BatchGetSecretValue"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "RDS",
          "Effect" : "Allow",
          "Action" : [
            "rds-data:BatchExecuteStatement",
            "rds-data:ExecuteSql",
            "rds-data:ExecuteStatement",
            "rds-data:RollbackTransaction",
            "rds-data:BeginTransaction",
            "rds-data:CommitTransaction",
            "rds-db:connect"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]
    })

  }

}
module "password-protection-pod-role" {
  source = "../modules/pod_role"
  name   = "password-protection-pod-role"

  cluster_name         = aws_eks_cluster.eks.name
  namespace            = "app"
  service_account_name = "password-protection"
  inline_policies = {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "SecretManagerRead",
          "Effect" : "Allow",
          "Action" : [
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetSecretValue",
            "secretsmanager:BatchGetSecretValue"
          ],
          "Resource" : [
            "*"
          ]
        },
        {
          "Sid" : "RDS",
          "Effect" : "Allow",
          "Action" : [
            "rds-data:BatchExecuteStatement",
            "rds-data:ExecuteSql",
            "rds-data:ExecuteStatement",
            "rds-data:RollbackTransaction",
            "rds-data:BeginTransaction",
            "rds-data:CommitTransaction",
            "rds-db:connect"
          ],
          "Resource" : [
            "*"
          ]
        }
      ]
    })

  }

}
