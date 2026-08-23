# EDUCATION MANAGEMENT SYSTEM FRONTEND

## DOCKER

```bash
docker build -t devyudhaginongpratidina140/ems-frontend:1.0.0 .
docker push devyudhaginongpratidina140/ems-frontend:1.0.0
docker pull devyudhaginongpratidina140/ems-frontend:1.0.0
```

```bash
docker run -d \
  --name ems-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://host:port \
  devyudhaginongpratidina140/ems-frontend:1.0.0
```
