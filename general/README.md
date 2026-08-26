# General Service for Supernatural

## Description
Sets up database and Django application service for Supernatural with Docker. Creates database with a user, migrates models from Django application into created database.

## Steps
- Run `docker compose up --build` in root directory
- To test db backup creation run `docker compose exec db_backup /usr/local/bin/backup.sh`
