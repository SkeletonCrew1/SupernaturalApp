resource "aws_eks_addon" "metrics-server" {
  cluster_name = aws_eks_cluster.eks.name
  addon_name   = "metrics-server"

  resolve_conflicts_on_create = "OVERWRITE"
}

resource "aws_eks_addon" "cert-manager" {
  cluster_name = aws_eks_cluster.eks.name
  addon_name   = "cert-manager"

  resolve_conflicts_on_create = "OVERWRITE"
}