# Supernatural

This repository contains secure social network application that consists of several microservices run inside Docker containers orchestrated by Docker Compose. Our application features:

* Application is protected by a password
* New password is mailed daily to registered users
* Users have different tiers (copper, silver, gold)
* Users are able to log in with their email and password
* Users are assigned randomized aliases (no real names used)
* Reported or banned users are redirected to a different site
* Compromised button that deletes all data in our database
* User promotion is done by voting
* Inquisitor can vote to excommunicade a user
* New users can be invited via email (bypassing website password-protection)
* Some users can send email to masons of selected tier

```text
.
├── auth                  # User authentication service
├── cleanup               # Cleanup service for erase database button
├── docs                  # Documentation folder
├── frontend              # Web UI service for application
├── general               # General service:
│                             * Django application
│                             * Database
│                             * Database backups
├── mail_sending          # Mail sending service
└── docker-compose.yml    # Main entrypoint of our application
```

## Prerequisites

* Docker version 29.6.2
* Docker Compose version 5.3.1

## Steps to Run

1. Add `.env` to root directory
2. Add `s3config.json` to `/general/seaweedfs-config/s3config.json`
3. Run `bash docker compose up --build`
