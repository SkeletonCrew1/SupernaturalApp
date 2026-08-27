resource "kubernetes_namespace_v1" "application" {
  metadata {
    name = "application"
  }
}

resource "helm_release" "secrets_store_csi_driver" {
  name       = "csi-secrets-store"
  repository = "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts"
  chart      = "secrets-store-csi-driver"
  namespace  = "kube-system"

  values = [
    yamlencode({
      rbac = {
        create = true
      }
      syncSecret = {
        enabled = true
      }
      enableSecretRotation = true
      providers = {
        aws = true
      }
      tokenRequests = [
        {
          audience = "sts.amazonaws.com"
        },
        {
          audience = "pods.eks.amazonaws.com"
        }
      ]
    })
  ]

  depends_on = [
    aws_eks_node_group.general
  ]
}

resource "aws_eks_addon" "pod_identity_agent" {
  cluster_name = aws_eks_cluster.eks.name
  addon_name   = "eks-pod-identity-agent"

  resolve_conflicts_on_create = "OVERWRITE"
}

data "aws_iam_policy_document" "app_secrets_assume_role" {
  statement {
    actions = ["sts:AssumeRole", "sts:TagSession"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["pods.eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eks_secrets_manager_role_app" {
  name               = "eks-secrets-manager-role-app"
  assume_role_policy = data.aws_iam_policy_document.app_secrets_assume_role.json
}

resource "aws_iam_role_policy_attachment" "secrets_manager_read_write" {
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
  role       = aws_iam_role.eks_secrets_manager_role_app.name
}

resource "kubernetes_service_account_v1" "app_service_account" {
  metadata {
    name      = "app-service-account"
    namespace = kubernetes_namespace_v1.application.metadata[0].name
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.eks_secrets_manager_role_app.arn
    }
  }

  automount_service_account_token = true
}

resource "aws_eks_pod_identity_association" "app_pod_identity" {
  cluster_name    = aws_eks_cluster.eks.name
  namespace       = kubernetes_namespace_v1.application.metadata[0].name
  service_account = kubernetes_service_account_v1.app_service_account.metadata[0].name
  role_arn        = aws_iam_role.eks_secrets_manager_role_app.arn

  depends_on = [aws_eks_addon.pod_identity_agent]
}

resource "helm_release" "secrets_store_csi_driver_provider_aws" {
  name       = "aws-secrets-provider"
  repository = "https://aws.github.io/secrets-store-csi-driver-provider-aws"
  chart      = "secrets-store-csi-driver-provider-aws"
  namespace  = "kube-system"

  values = [
    yamlencode({
      secrets-store-csi-driver = {
        install = false
      }
    })
  ]

  depends_on = [
    helm_release.secrets_store_csi_driver
  ]
}
