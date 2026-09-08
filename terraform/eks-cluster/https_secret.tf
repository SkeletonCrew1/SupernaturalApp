resource "kubernetes_secret_v1" "cloudflare_api_token" {
  metadata {
    name      = "cloudflare-api-token-secret"
    namespace = "cert-manager"
  }

  data = {
    "api-token" = jsondecode(
      data.aws_secretsmanager_secret_version.CLOUDFLARE_API_KEY.secret_string
    )["CLOUDFLARE_API_KEY"]
  }

  type = "Opaque"
  depends_on = [
    aws_eks_addon.cert-manager,
  ]
}
