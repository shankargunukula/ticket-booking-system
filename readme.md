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
docker compose up -d --build notification-service
docker compose up -d --build registration-service
docker compose up -d --build booking-service


# create WEB application
# 1. Initialize a clean React + TypeScript workspace using Vite
npm create vite@latest web-frontend -- --template react-ts

# 2. Navigate inside and add the Axios library for routing HTTP API requests
cd web-frontend
npm install axios



# create backend for Node js
mkdir -p backend/{config,controllers,routes,middleware,validation} && touch backend/{server.js,.env,.gitignore}
npm install express ldapjs cors zod dotenv


# If docker is crashed or not responding then 
taskkill /F /IM "Docker Desktop.exe"
docker start docker-desktop

#Prune and Flush Stalled Communications
docker system prune --volumes -f

# Clear Corrupted LDAP Volumes

# 1. Shut down the system completely
docker compose down

# 2. Forcefully delete the cached database storage volumes
docker volume rm ticket-booking-system_ldap_data ticket-booking-system_ldap_config

# 3. Boot up the directory service freshly
docker compose up -d openldap


# CPU Usage
docker stats


# 1. Clear existing environments and dangling volumes
docker compose down

# 2. Flush out the previous broken LDAP storage volumes
docker volume rm ticket-booking-system_ldap_data ticket-booking-system_ldap_config

# 3. Start up OpenLDAP independently first to complete database files provisioning
docker compose up -d openldap

# 4. Check that OpenLDAP transitions into a healthy status
sleep 15
docker ps --filter name=ticket-openldap

# 5. Bring up the rest of the application network stack
docker compose up -d




# for Network in Use Error
# 1. Stop all container instances running on your engine immediately
docker stop $(docker ps -aq)

# 2. Remove all dead or orphaned container instances completely
docker rm $(docker ps -aq)

# 3. Clean out all unused dangling virtual networks in one click
docker network prune -f
