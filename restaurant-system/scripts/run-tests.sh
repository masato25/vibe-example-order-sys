#!/bin/bash

# Restaurant System - Test Runner Script
# Runs all tests across the project

set -e

echo "🧪 Restaurant System - Running All Tests"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED_TESTS=""
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run a test suite
run_test_suite() {
    local name=$1
    local command=$2
    local directory=$3
    
    echo ""
    echo -e "${YELLOW}Running $name tests...${NC}"
    echo "----------------------------------------"
    
    if [ -n "$directory" ]; then
        cd "$directory"
    fi
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $name tests passed!${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $name tests failed!${NC}"
        FAILED_TESTS="$FAILED_TESTS\n  - $name"
    fi
    
    ((TOTAL_TESTS++))
    
    if [ -n "$directory" ]; then
        cd - > /dev/null
    fi
}

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Start test services if needed
echo "🐳 Starting test environment..."
docker-compose -f docker-compose.test.yml up -d --build postgres redis

# Wait for test database to be ready
echo "⏳ Waiting for test database..."
sleep 10

# Frontend Unit Tests
run_test_suite "Frontend Unit" "npm run test:unit" "frontend"

# Frontend Integration Tests  
run_test_suite "Frontend Integration" "npm run test:integration" "frontend"

# Pricing Service Tests
run_test_suite "Pricing Service" "python -m pytest tests/ -v --cov=app --cov-report=term-missing" "pricing-service"

# API Integration Tests
echo ""
echo -e "${YELLOW}Running API Integration tests...${NC}"
echo "----------------------------------------"

# Set up test database
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_test < schema.sql
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_test < sample-data.sql

if cd frontend && npm run test:api; then
    echo -e "${GREEN}✅ API Integration tests passed!${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ API Integration tests failed!${NC}"
    FAILED_TESTS="$FAILED_TESTS\n  - API Integration"
fi
((TOTAL_TESTS++))
cd ..

# E2E Tests (optional - only if Cypress is available)
if [ -f "frontend/cypress.config.ts" ]; then
    # Start the application for E2E tests
    echo ""
    echo -e "${YELLOW}Starting application for E2E tests...${NC}"
    docker-compose up -d
    sleep 30 # Wait for all services to be ready
    
    run_test_suite "E2E" "npm run test:e2e:headless" "frontend"
    
    # Stop the application
    docker-compose down
fi

# Cleanup test environment
echo ""
echo "🧹 Cleaning up test environment..."
docker-compose -f docker-compose.test.yml down

# Test Results Summary
echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "Total test suites: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Ready for deployment!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed:${NC}"
    echo -e "$FAILED_TESTS"
    echo ""
    echo -e "${YELLOW}Please fix the failing tests before deploying.${NC}"
    exit 1
fi