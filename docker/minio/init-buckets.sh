#!/bin/sh
/usr/bin/mc alias set local http://localhost:9000 minioadmin minioadmin
/usr/bin/mc mb --ignore-existing local/tunijobs-cv
/usr/bin/mc mb --ignore-existing local/tunijobs-logos
/usr/bin/mc anonymous set download local/tunijobs-logos
echo "MinIO buckets initialized successfully."
exit 0
