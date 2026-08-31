data "aws_secretsmanager_secret" "DB_PASSWORD" {
  name = "DB_PASS"
}
data "aws_secretsmanager_secret_version" "DB_PASS" {
  secret_id = data.aws_secretsmanager_secret.DB_PASSWORD.id
}
data "aws_secretsmanager_secret" "DB_USERNAME" {
  name = "DB_USER"
}
data "aws_secretsmanager_secret_version" "DB_USER" {
  secret_id = data.aws_secretsmanager_secret.DB_USERNAME.id
}
data "aws_secretsmanager_secret" "DB_NAMING" {
  name = "DB_NAME"
}
data "aws_secretsmanager_secret_version" "DB_NAME" {
  secret_id = data.aws_secretsmanager_secret.DB_NAMING.id
}
