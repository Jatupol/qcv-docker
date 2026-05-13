# Build   Front-end Image
podman build -t oqa-qc-frontend:1.0.0 -f Containerfile .

# Build   Front-end IContainer
podman run -d \
  --name oqa-qc-frontend \
  --network tigernetwork \
  -p 8081:80 \
  -v /mnt/Data/Tiger/qcv-system/frontend_app/dist:/usr/share/nginx/html:Z \
  --restart unless-stopped \
  oqa-qc-frontend:1.0.0
 