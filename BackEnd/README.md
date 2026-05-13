# Server  tnhkdds-app01
# Build Back-end Image
podman build -t localhost/oqa-qc-backend:1.0.0 -f Containerfile .

# Build Back-end Contrainer

podman run -d \
    --name oqa-qc-backend \
    --network tigernetwork \
    -v /mnt/Data/Tiger/qcv-system/backend_app/dist:/app/dist:Z \
    -v /mnt/Data/Tiger/qcv-system/backend_app/logs:/app/logs:Z \
    -v /mnt/Data/Tiger/qcv-system/backend_app/uploads:/app/uploads:Z \
    -v /mnt/Data/Tiger/qcv-system/backend_app/reports:/app/reports:Z \
    -v /mnt/Data/Tiger/qcv-system/backend_app/temp:/app/temp:Z \
    -e DB_HOST=localhost \
    --env-file /mnt/Data/Tiger/qcv-system/backend_app/.env \
    --restart unless-stopped \
    localhost/oqa-qc-backend:1.0.0

 