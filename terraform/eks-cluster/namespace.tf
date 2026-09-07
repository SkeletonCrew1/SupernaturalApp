resource "kubernetes_namespace_v1" "consul" {
  metadata {
    name = "consul"
  }
}
resource "kubernetes_namespace_v1" "app" {
  metadata {
    name = "app"
  }
}
