resource "kubernetes_namespace_v1" "jenkins" {
  metadata {
    name = "jenkins"
  }
}

resource "helm_release" "jenkins" {
  name       = "jenkins"
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  namespace  = kubernetes_namespace_v1.jenkins.metadata[0].name

  values = [
    yamlencode({
      controller = {
        serviceType = "ClusterIP"
        servicePort = 8080
        ingress = {
          enabled = false
        }
        installPlugins = [
          "blueocean:latest",
          "ws-cleanup:latest"
        ]
      }
      persistence = {
        enabled = false
      }
    })
  ]

  depends_on = [
    kubernetes_namespace_v1.jenkins
  ]
}

data "kubernetes_secret_v1" "jenkins_initial_password" {
  metadata {
    name      = "jenkins"
    namespace = kubernetes_namespace_v1.jenkins.metadata[0].name
  }

  depends_on = [helm_release.jenkins]
}

resource "aws_secretsmanager_secret" "jenkins_password" {
  name                    = "JENKINS_PASSWORD"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jenkins_password_val" {
  secret_id = aws_secretsmanager_secret.jenkins_password.id
  secret_string = jsonencode({
    JENKINS_PASSWORD = data.kubernetes_secret_v1.jenkins_initial_password.data["jenkins-admin-password"]
  })
}