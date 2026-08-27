resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.eks.identity[0].oidc[0].issuer
}

data "tls_certificate" "eks" {
  url = aws_eks_cluster.eks.identity[0].oidc[0].issuer
}

data "aws_iam_policy_document" "ebs_csi_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }
  }
}

resource "aws_iam_role" "ebs_csi_driver" {
  name               = "eks-ebs-csi-driver-role"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ebs_csi_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi_driver.name
}

resource "aws_eks_addon" "ebs_csi" {
  cluster_name                = aws_eks_cluster.eks.name
  addon_name                  = "aws-ebs-csi-driver"
  service_account_role_arn    = aws_iam_role.ebs_csi_driver.arn
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [
    aws_eks_node_group.general,
    aws_iam_role_policy_attachment.ebs_csi_policy
  ]
}

data "aws_secretsmanager_secret_version" "smtp_sender" {
  secret_id = "GRAFANA_SMTP_SENDER"
}

data "aws_secretsmanager_secret_version" "smtp_password" {
  secret_id = "GRAFANA_SMTP_PASSWORD"
}

resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_secret_v1" "grafana_smtp" {
  metadata {
    name      = "grafana-smtp-secret"
    namespace = kubernetes_namespace_v1.monitoring.metadata[0].name
  }

  data = {
    user     = jsondecode(data.aws_secretsmanager_secret_version.smtp_sender.secret_string)["GRAFANA_SMTP_SENDER"]
    password = jsondecode(data.aws_secretsmanager_secret_version.smtp_password.secret_string)["GRAFANA_SMTP_PASSWORD"]
  }
}

resource "kubernetes_config_map_v1" "grafana_dashboards" {
  metadata {
    name      = "grafana-default-dashboards"
    namespace = kubernetes_namespace_v1.monitoring.metadata[0].name
    labels = {
      grafana_dashboard = "1"
    }
  }

  data = {
    "dashboard.json" = file("${path.module}/grafana-data/dashboard.json")
  }
}

resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "prometheus"
  namespace  = kubernetes_namespace_v1.monitoring.metadata[0].name

  values = [
    yamlencode({
      server = {
        persistentVolume = {
          enabled = false
        }
      }
      alertmanager = {
        enabled = false
      }
      prometheus-pushgateway = {
        enabled = false
      }
    })
  ]

  depends_on = [
    aws_eks_node_group.general,
    # helm_release.aws_load_balancer_controller,
    kubernetes_namespace_v1.monitoring
  ]
}

resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana-community.github.io/helm-charts"
  chart      = "grafana"
  namespace  = kubernetes_namespace_v1.monitoring.metadata[0].name

  values = [
    file("${path.module}/grafana-data/grafana-values.yaml"),
    yamlencode({
      sidecar = {
        dashboards = {
          enabled         = true
          searchNamespace = "monitoring"
        }
      }
    })
  ]

  depends_on = [
    aws_eks_node_group.general,
    # helm_release.aws_load_balancer_controller,
    helm_release.prometheus,
    kubernetes_config_map_v1.grafana_dashboards,
    kubernetes_secret_v1.grafana_smtp
  ]
}

data "kubernetes_secret_v1" "grafana_admin_password" {
  metadata {
    name      = "grafana"
    namespace = kubernetes_namespace_v1.monitoring.metadata[0].name
  }

  depends_on = [helm_release.grafana]
}

resource "aws_secretsmanager_secret" "grafana_password" {
  name                    = "GRAFANA_PASSWORD"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "grafana_password_val" {
  secret_id = aws_secretsmanager_secret.grafana_password.id
  secret_string = jsonencode({
    GRAFANA_PASSWORD = data.kubernetes_secret_v1.grafana_admin_password.data["admin-password"]
  })
}
