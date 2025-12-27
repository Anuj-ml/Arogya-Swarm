#!/bin/bash

# Arogya-Swarm Setup Script
# This script sets up the complete development environment

set -e

echo "🏥 Arogya-Swarm Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Setup backend environment
echo "🔧 Setting up backend environment..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Created backend/.env from .env.example${NC}"
    echo -e "${YELLOW}⚠ Please edit backend/.env and add your API keys${NC}"
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi

# Setup frontend environment
echo "🔧 Setting up frontend environment..."
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ Frontend .env already exists${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Edit backend/.env and add your API keys"
echo "2. Run: docker-compose up -d"
echo "3. Access the application at:"
echo "   - Landing: http://localhost:5173"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "For manual setup without Docker, see README.md"
echo "========================================"
