import os
import httpx
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class SupabaseConfig:
    url: str
    anon_key: str
    service_role_key: Optional[str] = None


class SupabaseClient:
    def __init__(self, config: SupabaseConfig):
        self.config = config
        self.headers = {
            "apikey": config.anon_key,
            "Authorization": f"Bearer {config.anon_key}",
            "Content-Type": "application/json"
        }
    
    async def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert data into Supabase table"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.config.url}/rest/v1/{table}",
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def select(self, table: str, filters: Optional[Dict[str, Any]] = None) -> list:
        """Select data from Supabase table"""
        async with httpx.AsyncClient() as client:
            url = f"{self.config.url}/rest/v1/{table}"
            params = {}
            if filters:
                for key, value in filters.items():
                    params[key] = f"eq.{value}"
            
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
    
    async def update(self, table: str, data: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
        """Update data in Supabase table"""
        async with httpx.AsyncClient() as client:
            url = f"{self.config.url}/rest/v1/{table}"
            params = {}
            for key, value in filters.items():
                params[key] = f"eq.{value}"
            
            response = await client.patch(url, headers=self.headers, json=data, params=params)
            response.raise_for_status()
            return response.json()

    async def delete(self, table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Delete data from Supabase table"""
        async with httpx.AsyncClient() as client:
            url = f"{self.config.url}/rest/v1/{table}"
            params = {}
            for key, value in filters.items():
                params[key] = f"eq.{value}"
            
            response = await client.delete(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()

    async def sign_storage_url(self, bucket: str, object_path: str, expires_in: int = 300) -> Optional[str]:
        """Create a temporary signed URL for a storage object (requires service role key)."""
        if not self.config.service_role_key:
            return None
        async with httpx.AsyncClient() as client:
            url = f"{self.config.url}/storage/v1/object/sign/{bucket}/{object_path}"
            headers = {
                "Authorization": f"Bearer {self.config.service_role_key}",
                "apikey": self.config.anon_key,
                "Content-Type": "application/json",
            }
            resp = await client.post(url, headers=headers, json={"expiresIn": expires_in})
            if resp.status_code >= 400:
                return None
            data = resp.json()
            signed = data.get("signedURL") or data.get("signedUrl")
            if not signed:
                return None
            # Prepend base URL for absolute link
            return f"{self.config.url}{signed}"


def get_supabase_client() -> SupabaseClient:
    """Get Supabase client from environment variables"""
    config = SupabaseConfig(
        url=os.getenv("SUPABASE_URL", ""),
        anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
        service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    return SupabaseClient(config)
