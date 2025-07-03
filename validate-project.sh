#!/bin/bash

# Comprehensive Project Validation Script
# Ensures code quality and prevents runtime errors before commits

set -e

echo "🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon Race Scheduler - Project Validation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Track validation results
VALIDATION_PASSED=true

# Frontend Validation
if [ -d "frontend" ]; then
    print_status "Validating Frontend..."
    cd frontend
    
    # Check dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # TypeScript type checking
    print_status "TypeScript type checking..."
    if npx tsc --noEmit --skipLibCheck; then
        print_success "TypeScript validation passed"
    else
        print_error "TypeScript validation failed"
        VALIDATION_PASSED=false
    fi
    
    # ESLint (if available)
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
        print_status "Running ESLint..."
        if npx eslint src --ext .ts,.tsx --max-warnings 0; then
            print_success "ESLint validation passed"
        else
            print_error "ESLint validation failed"
            VALIDATION_PASSED=false
        fi
    fi
    
    # Build compilation test
    print_status "Testing build compilation..."
    if npm run build; then
        print_success "Build compilation passed"
        # Clean up build directory
        rm -rf build
    else
        print_error "Build compilation failed"
        VALIDATION_PASSED=false
    fi
    
    # Unit tests
    print_status "Running unit tests..."
    if npm test; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        VALIDATION_PASSED=false
    fi
    
    cd ..
else
    print_warning "Frontend directory not found"
fi

# Backend Validation
if [ -d "backend" ]; then
    print_status "Validating Backend..."
    cd backend
    
    # Check dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Syntax check
    print_status "Checking backend syntax..."
    if node -c server.js; then
        print_success "Backend syntax check passed"
    else
        print_error "Backend syntax check failed"
        VALIDATION_PASSED=false
    fi
    
    # Check for required files
    if [ -f "server.js" ]; then
        print_success "Main server file found"
    else
        print_error "server.js not found"
        VALIDATION_PASSED=false
    fi
    
    cd ..
else
    print_warning "Backend directory not found"
fi

# Git hooks setup
print_status "Setting up Git hooks..."
if [ -f ".githooks/pre-commit" ]; then
    git config core.hooksPath .githooks
    print_success "Git hooks configured"
else
    print_warning "Pre-commit hook not found"
fi

# Final result
echo ""
echo "=================================================="
if [ "$VALIDATION_PASSED" = true ]; then
    print_success "🎉 ALL VALIDATION CHECKS PASSED!"
    echo -e "${GREEN}Your project is ready for commit and deployment.${NC}"
    exit 0
else
    print_error "💥 VALIDATION FAILED!"
    echo -e "${RED}Please fix the issues above before committing.${NC}"
    exit 1
fi
