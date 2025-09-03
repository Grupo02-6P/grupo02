#!/bin/sh

echo "Aguardando Postgres em db:5432..."

while ! nc -z db 5432; do
  sleep 1
done

echo "Postgres iniciado!"

exec "$@"
