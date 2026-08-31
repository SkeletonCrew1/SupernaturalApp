resource "aws_security_group" "rds" {
  name        = "${var.identifier}-${local.env}-rds"
  description = "Allow PostgreSQL from EKS"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_eks" {
  security_group_id = aws_security_group.rds.id
  from_port         = 5432
  to_port           = 5432
  ip_protocol       = "tcp"
  cidr_ipv4         = local.vpc_cidr
}
