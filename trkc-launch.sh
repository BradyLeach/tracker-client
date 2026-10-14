#!/bin/bash

COMMAND=$1
TARGET=$2

header() {
    echo
    echo "--------------------------------------------------------------"
}

wait_for_docker() {
    timeout=60
    while ! docker info &> /dev/null; do
        ((timeout--))
        if [[ $timeout -eq 0 ]]; then
            echo "❌ Docker did not start in time. Exiting."
            exit 1
        fi
        sleep 2
    done
}

start_docker() {
    if ! docker info &> /dev/null; then
        echo "🐳 Docker is not running. Starting Docker Desktop..."
        powershell.exe -Command "Start-Process 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe' -NoNewWindow"
        echo "⏳ Waiting for Docker to initialize..."
        wait_for_docker
        echo "✅ Docker is ready!"
    fi
}

start_docker

# Ensure the shared network exists (decoupled from any compose stack)
docker network inspect tracker-network &> /dev/null || docker network create tracker-network

# Utility: Print service URLs
print_urls() {
    echo
    echo "  🌐  App   https://192.168.1.104:446"
    echo
}

header
echo

case "$COMMAND" in
    docker)
        echo "🏗️ Rebuilding frontend container... 🏗️"
        header
        docker compose build frontend
        ;;
    start)
        echo "▶️ Starting frontend (dev mode)... ▶️"
        header
        docker compose up -d frontend
        print_urls
        ;;
    stop)
        echo "🛑 Stopping frontend... 🛑"
        header
        docker compose stop frontend frontend-prod
        ;;
    burn)
        echo "🔥 Removing frontend container and volumes... 🔥"
        header
        docker compose rm -sfv frontend frontend-prod
        ;;
    dev)
        echo "💻 Running frontend in development mode... 💻"
        header
        docker compose stop frontend-prod
        docker compose up -d frontend
        print_urls
        ;;
    build)
        echo "🚀 Building and running frontend in production (preview) mode... 🚀"
        header
        docker compose run --rm frontend npm run build
        ;;
    prod)
        echo "🚀 Building and running frontend in production (preview) mode... 🚀"
        header
        docker compose stop frontend
        docker compose up -d frontend-prod
        print_urls
        ;;
    reprod)
        echo "🔄 Rebuilding and relaunching production (preview) mode... 🔄"
        header
        docker compose stop frontend frontend-prod
        docker compose run --rm frontend npm run build
        docker compose up -d frontend-prod
        echo "🔧 Fixing NordVPN mesh→Docker forwarding..."
        sudo iptables -I FORWARD 1 -s 100.64.0.0/10 -d 172.16.0.0/12 -j ACCEPT
        print_urls
        ;;
    fix-net)
        echo "🔧 Fixing NordVPN mesh→Docker forwarding..."
        header
        sudo iptables -I FORWARD 1 -s 100.64.0.0/10 -d 172.16.0.0/12 -j ACCEPT
        echo "  ✅ Done"
        ;;
    unit)
        echo "🧪 Running unit tests... 🧪"
        header
        docker compose run --rm frontend npm run test:unit
        ;;
    integration)
        echo "🧪 Running integration tests... 🧪"
        header
        docker compose run --rm frontend npm run test:integration
        ;;
    lint)
        echo "🧹 Running ESLint checks... 🧹"
        header

        if docker compose ps -q frontend | grep -q .; then
            docker compose exec -T frontend npm run lint:fix
        else
            echo "❌ Frontend is not running. Start it with: $0 dev"
            exit 1
        fi
        ;;
    typecheck)
        echo "🔎 Running TypeScript checks..."
        header
        docker compose run --rm frontend npm run typecheck
        ;;
    status)
        echo "📊 Frontend status..."
        header
        if docker ps --filter "name=trkc_frontend_prod" --filter "status=running" -q | grep -q .; then
            echo "  Mode:      🚀 PRODUCTION (preview)"
            echo "  Container: trkc_frontend_prod"
        elif docker ps --filter "name=trkc_frontend" --filter "status=running" -q | grep -q .; then
            echo "  Mode:      💻 DEVELOPMENT"
            echo "  Container: trkc_frontend"
        else
            echo "  ⛔ No frontend container is running"
        fi
        echo
        ;;
    logs)
        container="${TARGET:-trkc_frontend}"
        echo "📋 Viewing logs for: $container"
        header
        docker compose logs -f "$container"
        ;;
    install)
        echo "📦 Installing frontend dependencies... 📦"
        header
        if docker compose ps -q frontend | grep -q .; then
            docker compose exec frontend npm install --legacy-peer-deps
        else
            docker compose run --rm frontend npm install --legacy-peer-deps
        fi
        ;;
    host-install)
        echo "📦 Installing frontend host dependencies... 📦"
        header
        npm install --legacy-peer-deps
        ;;
    *)
        echo "Usage: $0 {docker|install|build|start|stop|burn|dev|prod|reprod|status|unit|integration|lint|typecheck|logs [container]}"
        exit 1
        ;;
esac
