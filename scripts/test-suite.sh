#!/bin/bash
# DocFlow Test Suite - Comprehensive testing script
# Usage: ./scripts/test-suite.sh [--quick|--full|--integration|--performance]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_MODE="${1:-quick}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="$PROJECT_ROOT/test-results/$TIMESTAMP"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/test.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/test.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/test.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/test.log"
}

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local log_file="$LOG_DIR/${test_name}.log"
    
    log_info "Running: $test_name"
    
    if eval "$test_command" > "$log_file" 2>&1; then
        log_success "$test_name passed"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "$test_name failed (see $log_file)"
        ((TESTS_FAILED++))
        return 1
    fi
}

skip_test() {
    local test_name="$1"
    local reason="$2"
    log_warning "Skipping $test_name: $reason"
    ((TESTS_SKIPPED++))
}

# Environment setup
setup_test_environment() {
    log_info "Setting up test environment..."
    
    cd "$PROJECT_ROOT"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install Python dependencies
    log_info "Installing Python dependencies..."
    pip install -q -r requirements.txt
    pip install -q -r requirements-dev.txt
    
    # Install Node.js dependencies
    if [ -f "package.json" ]; then
        log_info "Installing Node.js dependencies..."
        npm ci --silent
    fi
    
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend && npm ci --silent && cd ..
    fi
    
    # Set test environment variables
    export ENVIRONMENT=test
    export DATABASE_URL="sqlite:///test.db"
    export REDIS_URL="redis://localhost:6379/1"
    export JWT_SECRET="test-secret-key"
    export LOG_LEVEL="WARNING"
}

# Code quality tests
run_code_quality_tests() {
    log_info "Running code quality tests..."
    
    # Python code formatting
    run_test "black_check" "black --check --diff backend/ shared_core/"
    
    # Python import sorting
    run_test "isort_check" "isort --check-only --diff backend/ shared_core/"
    
    # Python linting
    run_test "flake8_check" "flake8 backend/ shared_core/ --max-line-length=88 --extend-ignore=E203,W503"
    
    # Python type checking
    run_test "mypy_check" "mypy backend/ shared_core/ --ignore-missing-imports"
    
    # Python security scan
    run_test "bandit_check" "bandit -r backend/ shared_core/ -f json -o $LOG_DIR/bandit-report.json"
    
    # Frontend linting (if exists)
    if [ -d "frontend" ]; then
        run_test "eslint_check" "cd frontend && npm run lint"
        run_test "typescript_check" "cd frontend && npx tsc --noEmit"
    fi
}

# Unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    
    # Backend unit tests
    run_test "backend_unit_tests" "pytest backend/tests/ -v --cov=backend --cov=shared_core --cov-report=html:$LOG_DIR/coverage-html --cov-report=xml:$LOG_DIR/coverage.xml --junit-xml=$LOG_DIR/pytest-report.xml"
    
    # Frontend unit tests (if exists)
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        if npm run --silent test --prefix frontend -- --version > /dev/null 2>&1; then
            run_test "frontend_unit_tests" "cd frontend && npm test -- --coverage --watchAll=false --coverageDirectory=$LOG_DIR/frontend-coverage"
        else
            skip_test "frontend_unit_tests" "No test script found"
        fi
    fi
}

# Integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    
    # Start test services
    start_test_services
    
    # Wait for services to be ready
    wait_for_services
    
    # Run integration tests
    run_test "api_integration_tests" "pytest tests/integration/ -v --tb=short"
    
    # Stop test services
    stop_test_services
}

# Performance tests
run_performance_tests() {
    log_info "Running performance tests..."
    
    # Start services for performance testing
    start_test_services
    wait_for_services
    
    # Run benchmark tests
    run_test "benchmark_tests" "pytest tests/performance/ --benchmark-json=$LOG_DIR/benchmark-results.json"
    
    # Run load tests (if locust is available)
    if command -v locust > /dev/null 2>&1; then
        run_test "load_tests" "locust -f tests/performance/locustfile.py --headless -u 10 -r 2 -t 30s --host http://localhost:8000 --html $LOG_DIR/load-test-report.html"
    else
        skip_test "load_tests" "Locust not installed"
    fi
    
    stop_test_services
}

# Service management
start_test_services() {
    log_info "Starting test services..."
    
    # Start Redis (if not running)
    if ! pgrep redis-server > /dev/null; then
        if command -v redis-server > /dev/null 2>&1; then
            redis-server --daemonize yes --port 6379 --logfile "$LOG_DIR/redis.log"
            sleep 2
        else
            log_warning "Redis not available, some tests may fail"
        fi
    fi
    
    # Start PostgreSQL (if configured)
    if [ -n "$POSTGRES_TEST_URL" ]; then
        # Run database migrations
        alembic upgrade head
    fi
    
    # Start backend service
    cd backend
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level warning > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend service (if exists)
    if [ -d "frontend" ]; then
        cd frontend
        npm run build > "$LOG_DIR/frontend-build.log" 2>&1
        npm start > "$LOG_DIR/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        cd ..
    fi
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for backend
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Backend service is ready"
            break
        fi
        sleep 1
    done
    
    # Wait for frontend (if running)
    if [ -n "$FRONTEND_PID" ]; then
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                log_success "Frontend service is ready"
                break
            fi
            sleep 1
        done
    fi
}

stop_test_services() {
    log_info "Stopping test services..."
    
    # Stop backend
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Stop frontend
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop Redis (if we started it)
    pkill -f "redis-server.*6379" 2>/dev/null || true
}

# Security tests
run_security_tests() {
    log_info "Running security tests..."
    
    # Dependency vulnerability scan
    if command -v safety > /dev/null 2>&1; then
        run_test "dependency_scan" "safety check --json --output $LOG_DIR/safety-report.json"
    else
        skip_test "dependency_scan" "Safety not installed"
    fi
    
    # OWASP ZAP baseline scan (if available)
    if command -v zap-baseline.py > /dev/null 2>&1; then
        start_test_services
        wait_for_services
        run_test "zap_baseline" "zap-baseline.py -t http://localhost:8000 -J $LOG_DIR/zap-report.json"
        stop_test_services
    else
        skip_test "zap_baseline" "OWASP ZAP not available"
    fi
}

# Smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    start_test_services
    wait_for_services
    
    # Basic API endpoints
    run_test "health_check" "curl -f http://localhost:8000/health"
    run_test "api_docs" "curl -f http://localhost:8000/docs"
    
    # Authentication endpoints
    run_test "auth_endpoints" "curl -f -X POST http://localhost:8000/api/auth/health"
    
    stop_test_services
}

# Database tests
run_database_tests() {
    log_info "Running database tests..."
    
    # Migration tests
    run_test "migration_up" "alembic upgrade head"
    run_test "migration_down" "alembic downgrade -1"
    run_test "migration_up_again" "alembic upgrade head"
    
    # Database schema validation
    run_test "schema_validation" "python -c 'from shared_core.utils.db import Base, engine; Base.metadata.create_all(bind=engine)'"
}

# Generate test report
generate_report() {
    local total_tests=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
    
    cat > "$LOG_DIR/test-report.md" << EOF
# DocFlow Test Report

**Generated:** $(date)
**Test Mode:** $TEST_MODE
**Duration:** $(($(date +%s) - START_TIME)) seconds

## Summary

- **Total Tests:** $total_tests
- **Passed:** $TESTS_PASSED
- **Failed:** $TESTS_FAILED
- **Skipped:** $TESTS_SKIPPED
- **Success Rate:** $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%

## Test Results

EOF
    
    # Add individual test results
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            test_name=$(basename "$log_file" .log)
            echo "### $test_name" >> "$LOG_DIR/test-report.md"
            echo '```' >> "$LOG_DIR/test-report.md"
            tail -20 "$log_file" >> "$LOG_DIR/test-report.md"
            echo '```' >> "$LOG_DIR/test-report.md"
            echo "" >> "$LOG_DIR/test-report.md"
        fi
    done
    
    log_info "Test report generated: $LOG_DIR/test-report.md"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    stop_test_services
    
    # Remove test database
    rm -f test.db
    
    # Deactivate virtual environment
    deactivate 2>/dev/null || true
}

# Main execution
main() {
    START_TIME=$(date +%s)
    
    log_info "Starting DocFlow test suite in $TEST_MODE mode"
    log_info "Results will be saved to: $LOG_DIR"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Setup environment
    setup_test_environment
    
    # Run tests based on mode
    case "$TEST_MODE" in
        "quick")
            run_code_quality_tests
            run_unit_tests
            run_smoke_tests
            ;;
        "full")
            run_code_quality_tests
            run_unit_tests
            run_database_tests
            run_integration_tests
            run_security_tests
            run_smoke_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        "security")
            run_security_tests
            ;;
        *)
            log_error "Unknown test mode: $TEST_MODE"
            echo "Usage: $0 [--quick|--full|--integration|--performance|--security]"
            exit 1
            ;;
    esac
    
    # Generate report
    generate_report
    
    # Final summary
    log_info "Test suite completed"
    log_info "Passed: $TESTS_PASSED, Failed: $TESTS_FAILED, Skipped: $TESTS_SKIPPED"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        log_error "Some tests failed. Check logs in $LOG_DIR"
        exit 1
    else
        log_success "All tests passed!"
        exit 0
    fi
}

# Run main function
main "$@"

