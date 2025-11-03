"""SSO implementation (SAML/OAuth)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from shared_core.utils.db import SessionLocal


def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix='/api/auth/sso', tags=['sso'])


# SAML Configuration (simplified for now)
SAML_CONFIG = {
    'sp': {
        'entityID': 'https://api.converto.fi/metadata/',
        'assertionConsumerService': {
            'url': 'https://api.converto.fi/api/auth/sso/acs',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        },
    },
    'idp': {
        'entityID': 'https://idp.example.com/metadata/',
        'singleSignOnService': {
            'url': 'https://idp.example.com/sso',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        },
    },
}


@router.get('/login')
async def sso_login() -> dict:
    """Initiate SSO login."""
    # TODO: Implement SAML auth flow
    return {
        'message': 'SSO login initiated',
        'redirect_url': '/api/auth/sso/acs',
    }


@router.post('/acs')
async def sso_acs(
    SAMLResponse: str,
    session: Session = Depends(get_db),
) -> dict:
    """SAML Assertion Consumer Service."""
    # TODO: Implement SAML response processing
    raise HTTPException(status_code=501, detail='SSO not yet implemented')


@router.get('/metadata')
async def sso_metadata() -> dict:
    """Return SAML metadata."""
    return {
        'message': 'SAML metadata',
        'config': SAML_CONFIG,
    }

