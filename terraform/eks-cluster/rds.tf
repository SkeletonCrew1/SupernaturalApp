resource "aws_secretsmanager_secret" "rds_secrets" {
  name                    = "microservice/rds_credential_${local.env}"
  recovery_window_in_days = 0
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_secretsmanager_secret_version" "rds_secrets" {
  secret_id = aws_secretsmanager_secret.rds_secrets.id
  secret_string = jsonencode({
    db_name  = var.rds_name
    username = var.rds_user
    password = var.rds_password
  })
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name = "${var.identifier}-${local.env}-subnet-group"
  subnet_ids = [
    aws_subnet.private_zone1.id,
    aws_subnet.private_zone2.id
  ]
}

resource "aws_db_parameter_group" "rds_postgres_group" {
  name_prefix = "custom-postgres17-${local.env}-"
  family      = "postgres17"
  description = "Custom parameter group for postgres 17 ${local.env} workloads"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_instance" "rds_postgres" {
  identifier     = "${var.identifier}-${local.env}"
  engine         = var.engine
  engine_version = var.engine_version

  instance_class      = var.instance_type
  allocated_storage   = var.allocated_storage
  storage_type        = var.storage_type
  publicly_accessible = var.publicly_accessible

  db_name  = var.rds_name
  username = var.rds_user
  password = var.rds_password

  parameter_group_name = aws_db_parameter_group.rds_postgres_group.name

  skip_final_snapshot = true

  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
}
