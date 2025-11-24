#!/usr/bin/env python3
"""Simple test entry point to debug Fly.io deployment."""

import sys
import os

print("Python version:", sys.version)
print("Current working directory:", os.getcwd())
print("PYTHONPATH:", os.environ.get('PYTHONPATH', 'Not set'))
print("Python path:")
for path in sys.path:
    print(f"  {path}")

print("\nTrying to import backend.main...")
try:
    from backend.main import app
    print("✅ Successfully imported backend.main")
    print("App type:", type(app))
except ImportError as e:
    print("❌ Failed to import backend.main:", e)
    print("Available directories in current path:")
    try:
        import os
        for item in os.listdir('.'):
            if os.path.isdir(item):
                print(f"  📁 {item}/")
    except Exception as e2:
        print("  Could not list directories:", e2)

print("\nTrying to import shared_core...")
try:
    from shared_core.middleware.auth import dev_auth
    print("✅ Successfully imported shared_core")
except ImportError as e:
    print("❌ Failed to import shared_core:", e)

print("\nTrying to run uvicorn...")
import subprocess
try:
    result = subprocess.run([
        "uvicorn", "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8080",
        "--log-level", "info"
    ], capture_output=True, text=True, timeout=5)
    print("Uvicorn exit code:", result.returncode)
    print("Uvicorn stdout:", result.stdout[:500])
    print("Uvicorn stderr:", result.stderr[:500])
except subprocess.TimeoutExpired:
    print("Uvicorn started successfully (timeout expected)")
except Exception as e:
    print("Failed to run uvicorn:", e)