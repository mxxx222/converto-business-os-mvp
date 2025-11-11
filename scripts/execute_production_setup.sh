#!/bin/bash
# 🚀 Production Setup Execution Script
# Execute critical 15% items for production launch

set -e

echo "🎯 PRODUCTION SETUP EXECUTION - CRITICAL 15%"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if required tools are available
check_requirements() {
    log_info "Checking system requirements..."
    
    commands=("curl" "dig" "nslookup" "git")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed"
            return 1
        fi
    done
    
    log_success "All required tools available"
}

# 1. Vercel Production Environment Verification
verify_vercel_environment() {
    log_info "Verifying Vercel production environment..."
    
    # Test if environment variables are configured
    if [ -f "apps/marketing/.env.production" ]; then
        log_success "Production environment template found"
        
        # Check for required variables
        required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "NEXT_PUBLIC_BASE_URL" "ADMIN_JWT_SECRET")
        
        for var in "${required_vars[@]}"; do
            if grep -q "$var=" apps/marketing/.env.production; then
                log_success "Variable $var configured"
            else
                log_warning "Variable $var not configured"
            fi
        done
    else
        log_error "Production environment file missing"
    fi
}

# 2. DNS Propagation Check
check_dns_propagation() {
    log_info "Checking DNS propagation for converto.fi..."
    
    # Check A record
    if nslookup converto.fi &> /dev/null; then
        log_success "Domain resolution working"
        
        # Check specific IP (Vercel)
        expected_ip="76.76.19.61"
        current_ip=$(nslookup converto.fi | grep -A1 "Name:" | grep "Address" | awk '{print $2}' | tail -1)
        
        if [ "$current_ip" = "$expected_ip" ]; then
            log_success "DNS correctly pointing to Vercel ($expected_ip)"
        else
            log_warning "DNS not yet propagated to Vercel. Current: $current_ip, Expected: $expected_ip"
        fi
    else
        log_error "Domain resolution failed"
    fi
    
    # Check www redirect
    if nslookup www.converto.fi &> /dev/null; then
        log_success "www subdomain resolving"
    else
        log_warning "www subdomain not resolving"
    fi
}

# 3. Email Authentication Test
test_email_authentication() {
    log_info "Testing email authentication records..."
    
    # Check SPF record
    if dig TXT converto.fi | grep -q "spf.resend.com"; then
        log_success "SPF record found for Resend"
    else
        log_warning "SPF record not found or not propagated"
    fi
    
    # Check DMARC record
    if dig TXT _dmarc.converto.fi | grep -q "DMARC1"; then
        log_success "DMARC record found"
    else
        log_warning "DMARC record not found"
    fi
    
    # Check DKIM records
    dkim_records=("resend._domainkey" "resend2._domainkey" "resend3._domainkey")
    for record in "${dkim_records[@]}"; do
        if dig CNAME $record.converto.fi | grep -q "resend.com"; then
            log_success "DKIM record $record found"
        else
            log_warning "DKIM record $record not found"
        fi
    done
}

# 4. Production Smoke Tests
run_smoke_tests() {
    log_info "Running production smoke tests..."
    
    # Test basic connectivity
    if curl -s -o /dev/null -w "%{http_code}" https://converto.fi | grep -q "200\|301\|302"; then
        log_success "Converto.fi responding"
    else
        log_error "Converto.fi not responding"
    fi
    
    # Test www redirect
    if curl -s -o /dev/null -w "%{http_code}" https://www.converto.fi | grep -q "200\|301\|302"; then
        log_success "www.converto.fi responding"
    else
        log_error "www.converto.fi not responding"
    fi
    
    # Test backend health
    backend_url="https://converto-business-os-quantum-mvp-1.onrender.com/health"
    if curl -s $backend_url | grep -q "healthy"; then
        log_success "Backend API healthy"
    else
        log_warning "Backend API health check failed"
    fi
}

# 5. Generate execution report
generate_execution_report() {
    log_info "Generating execution report..."
    
    timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    report_file="production_setup_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "PRODUCTION SETUP EXECUTION REPORT"
        echo "Generated: $timestamp"
        echo "=================================="
        echo ""
        echo "1. VERCEL ENVIRONMENT:"
        echo "   Status: Template created, manual configuration required"
        echo "   Action: Configure in Vercel dashboard"
        echo ""
        echo "2. DNS CONFIGURATION:"
        echo "   Status: Guide created, manual DNS update required"
        echo "   Action: Update DNS records at domain provider"
        echo ""
        echo "3. EMAIL AUTHENTICATION:"
        echo "   Status: Test procedures documented"
        echo "   Action: Execute Resend domain verification"
        echo ""
        echo "4. PRODUCTION DEPLOYMENT:"
        echo "   Status: Ready for execution"
        echo "   Action: Deploy when DNS propagates (24-48h)"
        echo ""
        echo "NEXT STEPS:"
        echo "- Configure Vercel environment variables"
        echo "- Update DNS records"
        echo "- Test email authentication"
        echo "- Execute soft launch (Nov 21)"
        echo "- Execute production go-live (Nov 22)"
    } > $report_file
    
    log_success "Report generated: $report_file"
}

# Main execution
main() {
    echo "Starting production setup execution..."
    echo ""
    
    check_requirements || exit 1
    echo ""
    
    verify_vercel_environment
    echo ""
    
    check_dns_propagation
    echo ""
    
    test_email_authentication
    echo ""
    
    run_smoke_tests
    echo ""
    
    generate_execution_report
    echo ""
    
    echo "🎯 EXECUTION COMPLETE"
    echo "====================="
    echo "Critical 15% status checked"
    echo "Manual actions required for production environment"
    echo "Execute soft launch Nov 21, production go-live Nov 22"
}

# Execute main function
main "$@"