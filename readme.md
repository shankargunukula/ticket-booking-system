# Re-evaluate changes
docker compose down

docker compose down -v

# Spin up infrastructure
docker compose up -d

# Execute the load test again
docker compose run --rm k6

# test id 10660
docker compose run --rm k6 run --tag testid=10660  /scripts/test.js

docker compose run --rm -e K6_OUT="influxdb=http://influxdb:8086/k6" k6 run --tag testid=10660  /scripts/test.js

docker compose run --rm -e K6_OUT="influxdb=http://influxdb:8086/k6" k6 run --tag testid=10660 --tag test_run=10660 --tag test=10660 /scripts/test.js



docker compose up --build -d notification-service
docker compose up --build -d booking-service



# create WEB application
# 1. Initialize a clean React + TypeScript workspace using Vite
npm create vite@latest web-frontend -- --template react-ts

# 2. Navigate inside and add the Axios library for routing HTTP API requests
cd web-frontend
npm install axios

