#!/usr/bin/env python3
"""DocFlow validation script - Comprehensive system validation."""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

import httpx
import psutil
import redis
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


class ValidationLevel(str, Enum):
    """Validation levels."""
    BASIC = "basic"
    STANDARD = "standard"
    COMPREHENSIVE = "comprehensive"


class ValidationStatus(str, Enum):
    """Validation status."""
    PASS = "PASS"
    FAIL = "FAIL"
    WARN = "WARN"
    SKIP = "SKIP"


@dataclass
class ValidationResult:
    """Validation result."""
    name: str
    status: ValidationStatus
    message: str
    details: Optional[Dict] = None
    duration: float = 0.0


class DocFlowValidator:
    """DocFlow system validator."""
    
    def __init__(self, level: ValidationLevel = ValidationLevel.STANDARD):
        self.level = level
        self.results: List[ValidationResult] = []
        self.start_time = time.time()
    
    def add_result(self, result: ValidationResult):
        """Add validation result."""
        self.results.append(result)
        
        # Color-coded output
        colors = {
            ValidationStatus.PASS: "\033[92m",  # Green
            ValidationStatus.FAIL: "\033[91m",  # Red
            ValidationStatus.WARN: "\033[93m",  # Yellow
            ValidationStatus.SKIP: "\033[94m",  # Blue
        }
        reset = "\033[0m"
        
        color = colors.get(result.status, "")
        print(f"{color}[{result.status}]{reset} {result.name}: {result.message}")
        
        if result.details:
            for key, value in result.details.items():
                print(f"  {key}: {value}")
    
    async def validate_all(self) -> bool:
        """Run all validations."""
        logger.info(f"Starting DocFlow validation (level: {self.level})")
        
        # Basic validations
        await self.validate_environment()
        await self.validate_dependencies()
        await self.validate_configuration()
        
        if self.level in [ValidationLevel.STANDARD, ValidationLevel.COMPREHENSIVE]:
            await self.validate_services()
            await self.validate_database()
            await self.validate_api_endpoints()
        
        if self.level == ValidationLevel.COMPREHENSIVE:
            await self.validate_security()
            await self.validate_performance()
            await self.validate_integrations()
        
        return self.generate_report()
    
    async def validate_environment(self):
        """Validate environment setup."""
        start_time = time.time()
        
        # Check Python version
        python_version = sys.version_info
        if python_version >= (3, 11):
            status = ValidationStatus.PASS
            message = f"Python {python_version.major}.{python_version.minor}.{python_version.micro}"
        else:
            status = ValidationStatus.FAIL
            message = f"Python {python_version.major}.{python_version.minor} (requires 3.11+)"
        
        self.add_result(ValidationResult(
            name="Python Version",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
        
        # Check virtual environment
        start_time = time.time()
        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            status = ValidationStatus.PASS
            message = "Virtual environment active"
        else:
            status = ValidationStatus.WARN
            message = "No virtual environment detected"
        
        self.add_result(ValidationResult(
            name="Virtual Environment",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
        
        # Check environment variables
        start_time = time.time()
        required_vars = [
            "DATABASE_URL",
            "REDIS_URL",
            "JWT_SECRET",
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if not missing_vars:
            status = ValidationStatus.PASS
            message = "All required environment variables set"
        else:
            status = ValidationStatus.FAIL
            message = f"Missing variables: {', '.join(missing_vars)}"
        
        self.add_result(ValidationResult(
            name="Environment Variables",
            status=status,
            message=message,
            details={"missing": missing_vars} if missing_vars else None,
            duration=time.time() - start_time
        ))
    
    async def validate_dependencies(self):
        """Validate Python dependencies."""
        start_time = time.time()
        
        try:
            # Check critical imports
            critical_imports = [
                "fastapi",
                "uvicorn",
                "sqlalchemy",
                "redis",
                "httpx",
                "pydantic",
            ]
            
            missing_imports = []
            for module in critical_imports:
                try:
                    __import__(module)
                except ImportError:
                    missing_imports.append(module)
            
            if not missing_imports:
                status = ValidationStatus.PASS
                message = "All critical dependencies available"
            else:
                status = ValidationStatus.FAIL
                message = f"Missing dependencies: {', '.join(missing_imports)}"
            
            self.add_result(ValidationResult(
                name="Python Dependencies",
                status=status,
                message=message,
                details={"missing": missing_imports} if missing_imports else None,
                duration=time.time() - start_time
            ))
            
        except Exception as e:
            self.add_result(ValidationResult(
                name="Python Dependencies",
                status=ValidationStatus.FAIL,
                message=f"Error checking dependencies: {e}",
                duration=time.time() - start_time
            ))
    
    async def validate_configuration(self):
        """Validate configuration files."""
        start_time = time.time()
        
        config_files = [
            "pyproject.toml",
            "requirements.txt",
            "alembic.ini",
        ]
        
        missing_files = []
        for file in config_files:
            if not (PROJECT_ROOT / file).exists():
                missing_files.append(file)
        
        if not missing_files:
            status = ValidationStatus.PASS
            message = "All configuration files present"
        else:
            status = ValidationStatus.WARN
            message = f"Missing files: {', '.join(missing_files)}"
        
        self.add_result(ValidationResult(
            name="Configuration Files",
            status=status,
            message=message,
            details={"missing": missing_files} if missing_files else None,
            duration=time.time() - start_time
        ))
    
    async def validate_services(self):
        """Validate external services."""
        # Redis validation
        await self._validate_redis()
        
        # Database validation
        await self._validate_database_connection()
    
    async def _validate_redis(self):
        """Validate Redis connection."""
        start_time = time.time()
        
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            r = redis.from_url(redis_url)
            
            # Test connection
            r.ping()
            
            # Test basic operations
            r.set("docflow:test", "validation", ex=10)
            value = r.get("docflow:test")
            
            if value == b"validation":
                status = ValidationStatus.PASS
                message = "Redis connection and operations working"
            else:
                status = ValidationStatus.FAIL
                message = "Redis operations failed"
            
        except redis.ConnectionError:
            status = ValidationStatus.FAIL
            message = "Cannot connect to Redis"
        except Exception as e:
            status = ValidationStatus.FAIL
            message = f"Redis error: {e}"
        
        self.add_result(ValidationResult(
            name="Redis Service",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
    
    async def _validate_database_connection(self):
        """Validate database connection."""
        start_time = time.time()
        
        try:
            database_url = os.getenv("DATABASE_URL")
            if not database_url:
                self.add_result(ValidationResult(
                    name="Database Connection",
                    status=ValidationStatus.SKIP,
                    message="No DATABASE_URL configured",
                    duration=time.time() - start_time
                ))
                return
            
            engine = create_engine(database_url)
            
            # Test connection
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                if result.fetchone()[0] == 1:
                    status = ValidationStatus.PASS
                    message = "Database connection working"
                else:
                    status = ValidationStatus.FAIL
                    message = "Database query failed"
            
        except SQLAlchemyError as e:
            status = ValidationStatus.FAIL
            message = f"Database error: {e}"
        except Exception as e:
            status = ValidationStatus.FAIL
            message = f"Unexpected database error: {e}"
        
        self.add_result(ValidationResult(
            name="Database Connection",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
    
    async def validate_database(self):
        """Validate database schema and migrations."""
        start_time = time.time()
        
        try:
            # Check if alembic is available
            from alembic.config import Config
            from alembic import command
            from alembic.runtime.migration import MigrationContext
            from alembic.script import ScriptDirectory
            
            # Check migration status
            database_url = os.getenv("DATABASE_URL")
            if not database_url:
                self.add_result(ValidationResult(
                    name="Database Migrations",
                    status=ValidationStatus.SKIP,
                    message="No DATABASE_URL configured",
                    duration=time.time() - start_time
                ))
                return
            
            alembic_cfg = Config(str(PROJECT_ROOT / "alembic.ini"))
            alembic_cfg.set_main_option("sqlalchemy.url", database_url)
            
            engine = create_engine(database_url)
            
            with engine.connect() as connection:
                context = MigrationContext.configure(connection)
                current_rev = context.get_current_revision()
                
                script = ScriptDirectory.from_config(alembic_cfg)
                head_rev = script.get_current_head()
                
                if current_rev == head_rev:
                    status = ValidationStatus.PASS
                    message = f"Database up to date (revision: {current_rev})"
                else:
                    status = ValidationStatus.WARN
                    message = f"Database needs migration (current: {current_rev}, head: {head_rev})"
            
        except ImportError:
            status = ValidationStatus.SKIP
            message = "Alembic not available"
        except Exception as e:
            status = ValidationStatus.FAIL
            message = f"Migration check failed: {e}"
        
        self.add_result(ValidationResult(
            name="Database Migrations",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
    
    async def validate_api_endpoints(self):
        """Validate API endpoints."""
        endpoints = [
            ("Health Check", "GET", "/health"),
            ("API Docs", "GET", "/docs"),
            ("Auth Health", "GET", "/api/auth/health"),
        ]
        
        base_url = "http://localhost:8000"
        
        async with httpx.AsyncClient() as client:
            for name, method, path in endpoints:
                start_time = time.time()
                
                try:
                    response = await client.request(method, f"{base_url}{path}")
                    
                    if response.status_code == 200:
                        status = ValidationStatus.PASS
                        message = f"Endpoint accessible (status: {response.status_code})"
                    else:
                        status = ValidationStatus.FAIL
                        message = f"Endpoint returned {response.status_code}"
                
                except httpx.ConnectError:
                    status = ValidationStatus.FAIL
                    message = "Service not running"
                except Exception as e:
                    status = ValidationStatus.FAIL
                    message = f"Request failed: {e}"
                
                self.add_result(ValidationResult(
                    name=f"API Endpoint: {name}",
                    status=status,
                    message=message,
                    duration=time.time() - start_time
                ))
    
    async def validate_security(self):
        """Validate security configuration."""
        start_time = time.time()
        
        # Check JWT secret strength
        jwt_secret = os.getenv("JWT_SECRET", "")
        if len(jwt_secret) >= 32:
            status = ValidationStatus.PASS
            message = "JWT secret is strong"
        elif len(jwt_secret) >= 16:
            status = ValidationStatus.WARN
            message = "JWT secret is weak (consider using 32+ characters)"
        else:
            status = ValidationStatus.FAIL
            message = "JWT secret is too weak or missing"
        
        self.add_result(ValidationResult(
            name="JWT Security",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
        
        # Check for development settings in production
        start_time = time.time()
        environment = os.getenv("ENVIRONMENT", "development")
        debug_mode = os.getenv("DEBUG", "false").lower() == "true"
        
        if environment == "production" and debug_mode:
            status = ValidationStatus.FAIL
            message = "Debug mode enabled in production"
        elif environment == "production":
            status = ValidationStatus.PASS
            message = "Production security settings OK"
        else:
            status = ValidationStatus.PASS
            message = f"Development environment ({environment})"
        
        self.add_result(ValidationResult(
            name="Security Settings",
            status=status,
            message=message,
            duration=time.time() - start_time
        ))
    
    async def validate_performance(self):
        """Validate system performance."""
        start_time = time.time()
        
        # Check system resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # CPU check
        if cpu_percent < 80:
            cpu_status = ValidationStatus.PASS
            cpu_message = f"CPU usage OK ({cpu_percent:.1f}%)"
        else:
            cpu_status = ValidationStatus.WARN
            cpu_message = f"High CPU usage ({cpu_percent:.1f}%)"
        
        # Memory check
        if memory.percent < 80:
            mem_status = ValidationStatus.PASS
            mem_message = f"Memory usage OK ({memory.percent:.1f}%)"
        else:
            mem_status = ValidationStatus.WARN
            mem_message = f"High memory usage ({memory.percent:.1f}%)"
        
        # Disk check
        if disk.percent < 90:
            disk_status = ValidationStatus.PASS
            disk_message = f"Disk usage OK ({disk.percent:.1f}%)"
        else:
            disk_status = ValidationStatus.WARN
            disk_message = f"High disk usage ({disk.percent:.1f}%)"
        
        self.add_result(ValidationResult(
            name="System Performance",
            status=cpu_status,  # Use worst status
            message=f"{cpu_message}, {mem_message}, {disk_message}",
            details={
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent
            },
            duration=time.time() - start_time
        ))
    
    async def validate_integrations(self):
        """Validate external integrations."""
        # This would validate external services like Supabase, Resend, etc.
        # For now, just check if configuration is present
        
        integrations = {
            "Supabase": ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
            "Resend": ["RESEND_API_KEY"],
            "Stripe": ["STRIPE_SECRET_KEY"],
        }
        
        for service, env_vars in integrations.items():
            start_time = time.time()
            
            missing_vars = [var for var in env_vars if not os.getenv(var)]
            
            if not missing_vars:
                status = ValidationStatus.PASS
                message = f"{service} configuration complete"
            else:
                status = ValidationStatus.WARN
                message = f"{service} missing: {', '.join(missing_vars)}"
            
            self.add_result(ValidationResult(
                name=f"Integration: {service}",
                status=status,
                message=message,
                duration=time.time() - start_time
            ))
    
    def generate_report(self) -> bool:
        """Generate validation report."""
        total_time = time.time() - self.start_time
        
        # Count results by status
        counts = {status: 0 for status in ValidationStatus}
        for result in self.results:
            counts[result.status] += 1
        
        # Determine overall status
        if counts[ValidationStatus.FAIL] > 0:
            overall_status = "FAILED"
            success = False
        elif counts[ValidationStatus.WARN] > 0:
            overall_status = "PASSED WITH WARNINGS"
            success = True
        else:
            overall_status = "PASSED"
            success = True
        
        # Print summary
        print("\n" + "="*60)
        print(f"DOCFLOW VALIDATION REPORT")
        print("="*60)
        print(f"Overall Status: {overall_status}")
        print(f"Total Time: {total_time:.2f} seconds")
        print(f"Validation Level: {self.level}")
        print()
        
        print("Results Summary:")
        for status in ValidationStatus:
            if counts[status] > 0:
                print(f"  {status}: {counts[status]}")
        
        print("\nDetailed Results:")
        for result in self.results:
            print(f"  [{result.status}] {result.name}: {result.message}")
        
        # Save JSON report
        report_data = {
            "timestamp": time.time(),
            "level": self.level,
            "overall_status": overall_status,
            "total_time": total_time,
            "summary": dict(counts),
            "results": [
                {
                    "name": r.name,
                    "status": r.status,
                    "message": r.message,
                    "details": r.details,
                    "duration": r.duration
                }
                for r in self.results
            ]
        }
        
        report_file = PROJECT_ROOT / "validation-report.json"
        with open(report_file, "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\nDetailed report saved to: {report_file}")
        
        return success


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="DocFlow System Validator")
    parser.add_argument(
        "--level",
        choices=[level.value for level in ValidationLevel],
        default=ValidationLevel.STANDARD.value,
        help="Validation level"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format"
    )
    
    args = parser.parse_args()
    
    validator = DocFlowValidator(ValidationLevel(args.level))
    success = await validator.validate_all()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())

