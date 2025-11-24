import hashlib
import os
import tempfile


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def tmp_path(name: str) -> str:
    p = os.path.join(tempfile.gettempdir(), name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p
