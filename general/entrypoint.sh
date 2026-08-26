printenv | grep -E '^(DB_HOST|DB_USER|DB_PASS|DB_NAME)=' > /etc/environment

echo "0 0 * * * . /etc/environment; /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root

touch /var/log/backup.log
crond -f -l 2
