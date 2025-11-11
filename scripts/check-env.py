#!/usr/bin/env python3
"""
Environment Variables Parity Checker
Ensures all environment variables used in code are documented in .env.example
"""

import os
import sys
import re
import glob
from pathlib import Path
from typing import Set, List, Tuple


def scan_environment_variables(directory: str) -> Set[str]:
    """Scan directory for process.env usage and collect variable names."""
    env_vars = set()
    
    # Patterns to match environment variable usage
    patterns = [
        r'process\.env\.([A-Z0-9_]+)',  # Python/JavaScript
        r'os\.getenv\(["\']([A-Z0-9_]+)["\']\)',  # Python os.getenv
        r'os\.environ\.get\(["\']([A-Z0-9_]+)["\']',  # Python os.environ
        r'getenv\(["\']([A-Z0-9_]+)["\']',  # General getenv
        r'@env\.([A-Z0-9_]+)',  # Astro/Vite style
    ]
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules, .next, etc.
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '.next', 'dist', 'build', '__pycache__', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.py', '.mjs', '.cjs')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        for pattern in patterns:
                            matches = re.findall(pattern, content)
                            env_vars.update(matches)
                            
                except Exception as e:
                    print(f"Warning: Could not read {file_path}: {e}")
                    continue
    
    return env_vars


def load_env_example(file_path: str = "env.modular.example") -> Set[str]:
    """Load documented environment variables from .env.example."""
    env_vars = set()
    
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found")
        return env_vars
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Extract variable name (everything before =)
                    var_name = line.split('=', 1)[0].strip()
                    if var_name:
                        env_vars.add(var_name)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return set()
    
    return env_vars


def check_parity(used_vars: Set[str], documented_vars: Set[str], directories: List[str]) -> Tuple[Set[str], Set[str]]:
    """Check which variables are missing from documentation and vice versa."""
    missing_in_docs = used_vars - documented_vars
    undocumented_in_use = documented_vars - used_vars
    
    return missing_in_docs, undocumented_in_use


def main():
    """Main function to run environment parity check."""
    print("🔍 Environment Variables Parity Checker")
    print("=" * 50)
    
    # Directories to scan
    scan_dirs = ['frontend', 'backend', 'shared_core', 'scripts', 'app']
    
    # Filter directories that exist
    existing_dirs = [d for d in scan_dirs if os.path.exists(d)]
    
    if not existing_dirs:
        print("❌ No source directories found to scan")
        return False
    
    print(f"Scanning directories: {', '.join(existing_dirs)}")
    
    # Scan for environment variables
    all_used_vars = set()
    for directory in existing_dirs:
        print(f"Scanning {directory}...")
        used_vars = scan_environment_variables(directory)
        all_used_vars.update(used_vars)
        if used_vars:
            print(f"  Found {len(used_vars)} variables: {', '.join(sorted(used_vars))}")
    
    # Load documented variables
    print("\nReading .env.example...")
    documented_vars = load_env_example()
    print(f"Found {len(documented_vars)} documented variables")
    
    # Check parity
    print("\nChecking parity...")
    missing_in_docs, undocumented_in_use = check_parity(all_used_vars, documented_vars, existing_dirs)
    
    # Report results
    print("\n" + "=" * 50)
    print("📊 PARITY CHECK RESULTS")
    print("=" * 50)
    
    if not missing_in_docs and not undocumented_in_use:
        print("✅ Environment variables are perfectly documented!")
        return True
    
    # Missing in documentation (critical)
    if missing_in_docs:
        print(f"❌ CRITICAL: {len(missing_in_docs)} variables used in code but not documented in .env.example:")
        for var in sorted(missing_in_docs):
            print(f"   • {var}")
        print("\nThese variables should be added to .env.example")
    
    # Undocumented in use (warning)
    if undocumented_in_use:
        print(f"\n⚠️  WARNING: {len(undocumented_in_use)} variables documented but not found in code:")
        for var in sorted(undocumented_in_use):
            print(f"   • {var}")
        print("\nThese variables might be legacy or in other locations")
    
    # Summary
    print(f"\n📈 Summary:")
    print(f"   Used in code: {len(all_used_vars)}")
    print(f"   Documented: {len(documented_vars)}")
    print(f"   Missing docs: {len(missing_in_docs)}")
    print(f"   Unused docs: {len(undocumented_in_use)}")
    
    # Exit with error if missing documentation
    if missing_in_docs:
        print(f"\n💥 CI BUILD FAILED: Add missing variables to .env.example")
        return False
    else:
        print(f"\n✅ CI BUILD PASSED: All used variables are documented")
        return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)