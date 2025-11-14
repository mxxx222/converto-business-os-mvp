"""PRH Avoin Data API client for Finnish company information."""

from __future__ import annotations

import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from functools import lru_cache

logger = logging.getLogger(__name__)

# PRH Avoin Data API base URL
PRH_API_BASE = "https://avoindata.prh.fi/bis/v1"

# Cache configuration
CACHE_TTL_HOURS = 24


class PRHClient:
    """
    Client for PRH Avoin Data API (Finnish Business Information System).
    
    Provides access to public company information from the Finnish Patent
    and Registration Office (PRH).
    """
    
    def __init__(self):
        self.base_url = PRH_API_BASE
        self.cache: Dict[str, tuple[Dict[str, Any], datetime]] = {}
        self.cache_ttl = timedelta(hours=CACHE_TTL_HOURS)
    
    async def get_company_info(self, y_tunnus: str) -> Optional[Dict[str, Any]]:
        """
        Get company information by Y-tunnus.
        
        Args:
            y_tunnus: Finnish business ID (format: 1234567-8)
        
        Returns:
            Company information dictionary or None if not found
        """
        if not y_tunnus:
            return None
        
        # Clean Y-tunnus (remove spaces, etc.)
        y_tunnus = y_tunnus.strip()
        
        # Check cache first
        cached_data = self._get_from_cache(y_tunnus)
        if cached_data:
            logger.debug(f"PRH cache hit for {y_tunnus}")
            return cached_data
        
        # Fetch from API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"{self.base_url}/{y_tunnus}"
                logger.info(f"Fetching PRH data for {y_tunnus}")
                
                response = await client.get(
                    url,
                    headers={
                        "Accept": "application/json",
                        "User-Agent": "DocFlow/1.0"
                    }
                )
                
                if response.status_code == 404:
                    logger.warning(f"Company not found in PRH: {y_tunnus}")
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                # Parse response
                company_info = self._parse_prh_response(data)
                
                if company_info:
                    # Cache the result
                    self._add_to_cache(y_tunnus, company_info)
                    logger.info(f"Successfully fetched PRH data for {y_tunnus}")
                
                return company_info
                
        except httpx.HTTPStatusError as e:
            logger.error(f"PRH API HTTP error for {y_tunnus}: {e.response.status_code}")
            return None
        except httpx.TimeoutException:
            logger.error(f"PRH API timeout for {y_tunnus}")
            return None
        except Exception as e:
            logger.error(f"PRH API error for {y_tunnus}: {str(e)}")
            return None
    
    def _parse_prh_response(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parse PRH API response to simplified format.
        
        Args:
            data: Raw PRH API response
        
        Returns:
            Simplified company information
        """
        results = data.get("results", [])
        if not results:
            return None
        
        company = results[0]
        
        # Extract basic information
        business_id = company.get("businessId")
        name = company.get("name")
        
        if not business_id or not name:
            return None
        
        # Extract company form
        company_form = company.get("companyForm")
        
        # Extract registration date
        registration_date = company.get("registrationDate")
        
        # Determine status
        status = "active"
        if company.get("businessLineCode"):
            status = "active"
        
        # Extract address
        address = self._extract_address(company)
        
        # Extract business lines
        business_lines = self._extract_business_lines(company)
        
        # Extract contact info
        contact_info = self._extract_contact_info(company)
        
        return {
            "y_tunnus": business_id,
            "name": name,
            "company_form": company_form,
            "registration_date": registration_date,
            "status": status,
            "address": address,
            "business_lines": business_lines,
            "contact_info": contact_info,
            "source": "PRH Avoin Data",
            "fetched_at": datetime.now().isoformat(),
        }
    
    def _extract_address(self, company: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """Extract company address from PRH data."""
        addresses = company.get("addresses", [])
        
        if not addresses:
            return None
        
        # Get first address (usually registered address)
        addr = addresses[0]
        
        return {
            "street": addr.get("street", ""),
            "postal_code": addr.get("postCode", ""),
            "city": addr.get("city", ""),
            "country": addr.get("country", "Finland"),
            "full_address": f"{addr.get('street', '')} {addr.get('postCode', '')} {addr.get('city', '')}".strip(),
        }
    
    def _extract_business_lines(self, company: Dict[str, Any]) -> list:
        """Extract business lines from PRH data."""
        business_lines = []
        
        # Get business line descriptions
        business_line_code = company.get("businessLineCode")
        business_line_text = company.get("businessLineText")
        
        if business_line_code or business_line_text:
            business_lines.append({
                "code": business_line_code,
                "description": business_line_text,
            })
        
        return business_lines
    
    def _extract_contact_info(self, company: Dict[str, Any]) -> Dict[str, Any]:
        """Extract contact information from PRH data."""
        contact_info = {}
        
        # Extract contact details if available
        contact_details = company.get("contactDetails", [])
        
        for detail in contact_details:
            detail_type = detail.get("type", "").lower()
            value = detail.get("value")
            
            if detail_type == "phone" or detail_type == "puhelin":
                contact_info["phone"] = value
            elif detail_type == "email" or detail_type == "sähköposti":
                contact_info["email"] = value
            elif detail_type == "website" or detail_type == "www":
                contact_info["website"] = value
        
        return contact_info
    
    def _get_from_cache(self, y_tunnus: str) -> Optional[Dict[str, Any]]:
        """Get company info from cache if not expired."""
        if y_tunnus in self.cache:
            data, cached_at = self.cache[y_tunnus]
            
            # Check if cache is still valid
            if datetime.now() - cached_at < self.cache_ttl:
                return data
            else:
                # Remove expired entry
                del self.cache[y_tunnus]
        
        return None
    
    def _add_to_cache(self, y_tunnus: str, data: Dict[str, Any]) -> None:
        """Add company info to cache."""
        self.cache[y_tunnus] = (data, datetime.now())
    
    def clear_cache(self) -> None:
        """Clear all cached data."""
        self.cache.clear()
        logger.info("PRH cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_entries = len(self.cache)
        
        # Count expired entries
        expired = 0
        for _, (_, cached_at) in self.cache.items():
            if datetime.now() - cached_at >= self.cache_ttl:
                expired += 1
        
        return {
            "total_entries": total_entries,
            "expired_entries": expired,
            "active_entries": total_entries - expired,
            "cache_ttl_hours": CACHE_TTL_HOURS,
        }


# Singleton instance
_prh_client: Optional[PRHClient] = None


@lru_cache(maxsize=1)
def get_prh_client() -> PRHClient:
    """Get or create PRH client singleton."""
    global _prh_client
    
    if _prh_client is None:
        _prh_client = PRHClient()
    
    return _prh_client

