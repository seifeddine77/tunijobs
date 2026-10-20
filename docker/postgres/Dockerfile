FROM pgvector/pgvector:pg16

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-16-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

COPY init-extensions.sql /docker-entrypoint-initdb.d/01-init-extensions.sql
