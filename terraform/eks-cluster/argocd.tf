resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace_v1.argocd.metadata[0].name

  values = [
    yamlencode({
      configs = {
        rbac = {
          "policy.default" = "role:admin"
        }
        params = {
          "server.insecure" = true
        }
      }
      controller = {
        metrics = {
          enabled = false
        }
      }
    })
  ]

  depends_on = [
    aws_eks_node_group.general,
    kubernetes_namespace_v1.argocd
  ]
}

data "kubernetes_secret_v1" "argocd_initial_password" {
  metadata {
    name      = "argocd-initial-admin-secret"
    namespace = kubernetes_namespace_v1.argocd.metadata[0].name
  }

  depends_on = [helm_release.argocd]
}

resource "aws_secretsmanager_secret" "argocd_password" {
  name                    = "ARGOCD_PASSWORD"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "argocd_password_val" {
  secret_id = aws_secretsmanager_secret.argocd_password.id
  secret_string = jsonencode({
    ARGOCD_PASSWORD = data.kubernetes_secret_v1.argocd_initial_password.data["password"]
  })
}