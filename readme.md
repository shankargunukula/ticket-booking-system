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

# 1. Take down the notification service container
docker compose down notification-service

# 2. Rebuild the service from scratch, ignoring all cached layers
docker compose build --no-cache notification-service

# 3. Spin the service back up in the background
docker compose up -d notification-service


# create WEB application
# 1. Initialize a clean React + TypeScript workspace using Vite
npm create vite@latest web-frontend -- --template react-ts

# 2. Navigate inside and add the Axios library for routing HTTP API requests
cd web-frontend
npm install axios



# create backend for Node js
mkdir -p backend/{config,controllers,routes,middleware,validation} && touch backend/{server.js,.env,.gitignore}
npm install express ldapjs cors zod dotenv