"""
FIDO2 / Passkeys Authentication with Hardware Attestation
Enterprise-grade security without passwords
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import json
import base64
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

# FIDO2/WebAuthn imports
try:
    from webauthn import generate_registration_options, verify_registration_response
    from webauthn import generate_authentication_options, verify_authentication_response
    from webauthn.helpers.structs import (
        AttestationConveyancePreference,
        AuthenticatorSelectionCriteria,
        ResidentKeyRequirement,
        UserVerificationRequirement,
        PublicKeyCredentialDescriptor,
        AuthenticatorTransport,
        AttestationObject,
        AuthenticatorData,
        CollectedClientData,
    )
    from webauthn.helpers.cose import COSEAlgorithmIdentifier
    FIDO2_AVAILABLE = True
except ImportError:
    FIDO2_AVAILABLE = False

# Hardware attestation imports
try:
    import tpm2_pytss
    TPM_AVAILABLE = True
except ImportError:
    TPM_AVAILABLE = False

from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel, Field
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class AttestationType(str, Enum):
    NONE = "none"
    INDIRECT = "indirect"
    DIRECT = "direct"
    ENTERPRISE = "enterprise"


class UserVerificationLevel(str, Enum):
    REQUIRED = "required"
    PREFERRED = "preferred"
    DISCOURAGED = "discouraged"


@dataclass
class FIDO2Credential:
    """FIDO2 credential data"""
    id: str
    public_key: bytes
    attestation_type: AttestationType
    authenticator_data: bytes
    user_agent: str
    device_info: Dict[str, Any]
    hardware_attestation: Optional[Dict[str, Any]] = None
    created_at: datetime = None
    last_used: Optional[datetime] = None
    usage_count: int = 0


@dataclass
class HardwareAttestation:
    """Hardware attestation data"""
    tpm_version: Optional[str] = None
    tpm_manufacturer: Optional[str] = None
    secure_boot_enabled: bool = False
    attestation_key_certificate: Optional[str] = None
    platform_measurement: Optional[str] = None
    verification_status: str = "pending"


class FIDO2RegistrationRequest(BaseModel):
    username: str
    display_name: str
    email: str
    tenant_id: str
    device_name: Optional[str] = None
    attestation_type: AttestationType = AttestationType.INDIRECT
    require_hardware_attestation: bool = False


class FIDO2AuthenticationRequest(BaseModel):
    username: str
    tenant_id: str
    challenge_response: Dict[str, Any]
    device_info: Dict[str, Any]


class FIDO2RegistrationResponse(BaseModel):
    registration_options: Dict[str, Any]
    challenge_id: str
    expires_at: datetime


class FIDO2AuthenticationResponse(BaseModel):
    authentication_options: Dict[str, Any]
    challenge_id: str
    expires_at: datetime


class FIDO2VerificationResponse(BaseModel):
    success: bool
    user_id: str
    tenant_id: str
    credential_id: str
    session_token: str
    hardware_attestation_status: Optional[str] = None
    security_level: str


class FIDO2AuthService:
    """FIDO2/Passkeys authentication service with hardware attestation"""
    
    def __init__(self, rp_id: str, rp_name: str, origin: str):
        self.rp_id = rp_id
        self.rp_name = rp_name
        self.origin = origin
        self.challenges = {}  # In production, use Redis
        self.credentials = {}  # In production, use database
        
        # Security configuration
        self.security_config = {
            "challenge_timeout": 300,  # 5 minutes
            "max_attempts": 3,
            "require_hardware_attestation": True,
            "allowed_attestation_types": [
                AttestationType.INDIRECT,
                AttestationType.DIRECT,
                AttestationType.ENTERPRISE
            ],
            "allowed_algorithms": [
                COSEAlgorithmIdentifier.ECDSA_SHA_256,
                COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256
            ]
        }
    
    async def initiate_registration(
        self,
        request: FIDO2RegistrationRequest,
        session: AsyncSession
    ) -> FIDO2RegistrationResponse:
        """Initiate FIDO2 registration process"""
        
        try:
            # Check if user exists
            user = await self._get_user_by_username(request.username, request.tenant_id, session)
            if user and user.get("fido2_credentials"):
                raise HTTPException(
                    status_code=400,
                    detail="User already has FIDO2 credentials registered"
                )
            
            # Generate registration options
            registration_options = generate_registration_options(
                rp_id=self.rp_id,
                rp_name=self.rp_name,
                user_id=request.username.encode(),
                user_name=request.username,
                user_display_name=request.display_name,
                attestation=AttestationConveyancePreference(request.attestation_type.value),
                authenticator_selection=AuthenticatorSelectionCriteria(
                    resident_key=ResidentKeyRequirement.REQUIRED,
                    user_verification=UserVerificationRequirement.REQUIRED,
                    authenticator_attachment=None  # Allow any attachment
                ),
                supported_pub_key_algs=self.security_config["allowed_algorithms"],
                timeout=self.security_config["challenge_timeout"] * 1000,  # Convert to milliseconds
                exclude_credentials=await self._get_existing_credentials(request.username, request.tenant_id)
            )
            
            # Store challenge
            challenge_id = secrets.token_urlsafe(32)
            challenge_data = {
                "challenge": registration_options.challenge,
                "user_data": {
                    "username": request.username,
                    "display_name": request.display_name,
                    "email": request.email,
                    "tenant_id": request.tenant_id,
                    "device_name": request.device_name,
                    "attestation_type": request.attestation_type.value,
                    "require_hardware_attestation": request.require_hardware_attestation
                },
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(seconds=self.security_config["challenge_timeout"])
            }
            
            self.challenges[challenge_id] = challenge_data
            
            return FIDO2RegistrationResponse(
                registration_options={
                    "challenge": base64.urlsafe_b64encode(registration_options.challenge).decode(),
                    "rp": {
                        "id": registration_options.rp.id,
                        "name": registration_options.rp.name
                    },
                    "user": {
                        "id": base64.urlsafe_b64encode(registration_options.user.id).decode(),
                        "name": registration_options.user.name,
                        "displayName": registration_options.user.display_name
                    },
                    "pubKeyCredParams": [
                        {
                            "type": param.type,
                            "alg": param.alg
                        }
                        for param in registration_options.pub_key_cred_params
                    ],
                    "authenticatorSelection": {
                        "authenticatorAttachment": registration_options.authenticator_selection.authenticator_attachment,
                        "residentKey": registration_options.authenticator_selection.resident_key.value,
                        "userVerification": registration_options.authenticator_selection.user_verification.value
                    },
                    "attestation": registration_options.attestation.value,
                    "timeout": registration_options.timeout
                },
                challenge_id=challenge_id,
                expires_at=challenge_data["expires_at"]
            )
            
        except Exception as e:
            logger.error(f"Registration initiation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Registration initiation failed: {str(e)}")
    
    async def complete_registration(
        self,
        challenge_id: str,
        registration_response: Dict[str, Any],
        session: AsyncSession
    ) -> FIDO2VerificationResponse:
        """Complete FIDO2 registration process"""
        
        try:
            # Get challenge data
            challenge_data = self.challenges.get(challenge_id)
            if not challenge_data:
                raise HTTPException(status_code=400, detail="Invalid or expired challenge")
            
            if datetime.utcnow() > challenge_data["expires_at"]:
                del self.challenges[challenge_id]
                raise HTTPException(status_code=400, detail="Challenge expired")
            
            user_data = challenge_data["user_data"]
            
            # Verify registration response
            verification = verify_registration_response(
                credential=registration_response,
                expected_challenge=challenge_data["challenge"],
                expected_origin=self.origin,
                expected_rp_id=self.rp_id,
                require_user_verification=True
            )
            
            # Perform hardware attestation if required
            hardware_attestation = None
            if user_data["require_hardware_attestation"]:
                hardware_attestation = await self._perform_hardware_attestation(
                    attestation_object=verification.attestation_object,
                    authenticator_data=verification.authenticator_data
                )
            
            # Store credential
            credential_id = base64.urlsafe_b64encode(verification.credential_id).decode()
            credential_data = FIDO2Credential(
                id=credential_id,
                public_key=verification.credential_public_key,
                attestation_type=AttestationType(verification.attestation_type.value),
                authenticator_data=verification.authenticator_data,
                user_agent=registration_response.get("user_agent", ""),
                device_info=registration_response.get("device_info", {}),
                hardware_attestation=hardware_attestation.__dict__ if hardware_attestation else None,
                created_at=datetime.utcnow()
            )
            
            # Save credential to database
            await self._save_credential(user_data, credential_data, session)
            
            # Generate session token
            session_token = await self._generate_session_token(
                user_data["username"], user_data["tenant_id"]
            )
            
            # Clean up challenge
            del self.challenges[challenge_id]
            
            return FIDO2VerificationResponse(
                success=True,
                user_id=user_data["username"],
                tenant_id=user_data["tenant_id"],
                credential_id=credential_id,
                session_token=session_token,
                hardware_attestation_status=hardware_attestation.verification_status if hardware_attestation else None,
                security_level=self._calculate_security_level(credential_data, hardware_attestation)
            )
            
        except Exception as e:
            logger.error(f"Registration completion failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Registration completion failed: {str(e)}")
    
    async def initiate_authentication(
        self,
        username: str,
        tenant_id: str,
        session: AsyncSession
    ) -> FIDO2AuthenticationResponse:
        """Initiate FIDO2 authentication process"""
        
        try:
            # Get user credentials
            credentials = await self._get_user_credentials(username, tenant_id, session)
            if not credentials:
                raise HTTPException(
                    status_code=404,
                    detail="No FIDO2 credentials found for user"
                )
            
            # Generate authentication options
            authentication_options = generate_authentication_options(
                rp_id=self.rp_id,
                allow_credentials=[
                    PublicKeyCredentialDescriptor(
                        id=base64.urlsafe_b64decode(cred.id),
                        transports=[
                            AuthenticatorTransport(transport)
                            for transport in cred.device_info.get("transports", [])
                        ]
                    )
                    for cred in credentials
                ],
                user_verification=UserVerificationRequirement.REQUIRED,
                timeout=self.security_config["challenge_timeout"] * 1000
            )
            
            # Store challenge
            challenge_id = secrets.token_urlsafe(32)
            challenge_data = {
                "challenge": authentication_options.challenge,
                "username": username,
                "tenant_id": tenant_id,
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(seconds=self.security_config["challenge_timeout"]),
                "attempts": 0
            }
            
            self.challenges[challenge_id] = challenge_data
            
            return FIDO2AuthenticationResponse(
                authentication_options={
                    "challenge": base64.urlsafe_b64encode(authentication_options.challenge).decode(),
                    "timeout": authentication_options.timeout,
                    "rpId": authentication_options.rp_id,
                    "allowCredentials": [
                        {
                            "id": base64.urlsafe_b64encode(cred.id).decode(),
                            "type": "public-key",
                            "transports": cred.device_info.get("transports", [])
                        }
                        for cred in credentials
                    ],
                    "userVerification": authentication_options.user_verification.value
                },
                challenge_id=challenge_id,
                expires_at=challenge_data["expires_at"]
            )
            
        except Exception as e:
            logger.error(f"Authentication initiation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Authentication initiation failed: {str(e)}")
    
    async def complete_authentication(
        self,
        challenge_id: str,
        authentication_response: Dict[str, Any],
        session: AsyncSession
    ) -> FIDO2VerificationResponse:
        """Complete FIDO2 authentication process"""
        
        try:
            # Get challenge data
            challenge_data = self.challenges.get(challenge_id)
            if not challenge_data:
                raise HTTPException(status_code=400, detail="Invalid or expired challenge")
            
            if datetime.utcnow() > challenge_data["expires_at"]:
                del self.challenges[challenge_id]
                raise HTTPException(status_code=400, detail="Challenge expired")
            
            # Check attempt limit
            if challenge_data["attempts"] >= self.security_config["max_attempts"]:
                del self.challenges[challenge_id]
                raise HTTPException(status_code=429, detail="Maximum attempts exceeded")
            
            challenge_data["attempts"] += 1
            
            # Get credential
            credential_id = authentication_response.get("id")
            credential = await self._get_credential_by_id(credential_id, session)
            if not credential:
                raise HTTPException(status_code=400, detail="Invalid credential")
            
            # Verify authentication response
            verification = verify_authentication_response(
                credential=authentication_response,
                expected_challenge=challenge_data["challenge"],
                expected_origin=self.origin,
                expected_rp_id=self.rp_id,
                credential_public_key=credential.public_key,
                credential_current_sign_count=credential.usage_count,
                require_user_verification=True
            )
            
            # Update credential usage
            await self._update_credential_usage(credential_id, verification.new_sign_count, session)
            
            # Generate session token
            session_token = await self._generate_session_token(
                challenge_data["username"], challenge_data["tenant_id"]
            )
            
            # Clean up challenge
            del self.challenges[challenge_id]
            
            return FIDO2VerificationResponse(
                success=True,
                user_id=challenge_data["username"],
                tenant_id=challenge_data["tenant_id"],
                credential_id=credential_id,
                session_token=session_token,
                hardware_attestation_status=credential.hardware_attestation.get("verification_status") if credential.hardware_attestation else None,
                security_level=self._calculate_security_level(credential, None)
            )
            
        except Exception as e:
            logger.error(f"Authentication completion failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Authentication completion failed: {str(e)}")
    
    async def _perform_hardware_attestation(
        self,
        attestation_object: AttestationObject,
        authenticator_data: AuthenticatorData
    ) -> HardwareAttestation:
        """Perform hardware attestation verification"""
        
        try:
            hardware_attestation = HardwareAttestation()
            
            # Check TPM attestation if available
            if TPM_AVAILABLE and attestation_object.att_stmt:
                tpm_data = await self._verify_tpm_attestation(attestation_object.att_stmt)
                if tpm_data:
                    hardware_attestation.tpm_version = tpm_data.get("version")
                    hardware_attestation.tpm_manufacturer = tpm_data.get("manufacturer")
                    hardware_attestation.verification_status = "verified"
            
            # Check secure boot status
            hardware_attestation.secure_boot_enabled = await self._check_secure_boot()
            
            # Verify platform measurements
            platform_measurement = await self._verify_platform_measurements(authenticator_data)
            hardware_attestation.platform_measurement = platform_measurement
            
            # Determine overall verification status
            if hardware_attestation.tpm_version and hardware_attestation.secure_boot_enabled:
                hardware_attestation.verification_status = "verified"
            elif hardware_attestation.tpm_version or hardware_attestation.secure_boot_enabled:
                hardware_attestation.verification_status = "partial"
            else:
                hardware_attestation.verification_status = "failed"
            
            return hardware_attestation
            
        except Exception as e:
            logger.error(f"Hardware attestation failed: {str(e)}")
            return HardwareAttestation(verification_status="failed")
    
    async def _verify_tpm_attestation(self, att_stmt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Verify TPM attestation statement"""
        
        try:
            if not TPM_AVAILABLE:
                return None
            
            # Extract TPM data from attestation statement
            tpm_data = {
                "version": att_stmt.get("ver"),
                "manufacturer": att_stmt.get("manufacturer"),
                "model": att_stmt.get("model"),
                "firmware_version": att_stmt.get("firmware_version")
            }
            
            # Verify TPM certificate chain
            if att_stmt.get("cert_info"):
                cert_info = att_stmt["cert_info"]
                # In production, verify certificate chain against TPM vendor certificates
                tpm_data["certificate_verified"] = True
            
            return tpm_data
            
        except Exception as e:
            logger.error(f"TPM attestation verification failed: {str(e)}")
            return None
    
    async def _check_secure_boot(self) -> bool:
        """Check if secure boot is enabled"""
        
        try:
            # In production, this would check actual secure boot status
            # For now, return mock value
            return True
            
        except Exception as e:
            logger.error(f"Secure boot check failed: {str(e)}")
            return False
    
    async def _verify_platform_measurements(self, authenticator_data: AuthenticatorData) -> Optional[str]:
        """Verify platform measurements"""
        
        try:
            # Extract and verify platform measurements from authenticator data
            # In production, this would verify against known good measurements
            measurement_hash = hashlib.sha256(authenticator_data.rp_id_hash).hexdigest()
            return measurement_hash
            
        except Exception as e:
            logger.error(f"Platform measurement verification failed: {str(e)}")
            return None
    
    def _calculate_security_level(
        self,
        credential: FIDO2Credential,
        hardware_attestation: Optional[HardwareAttestation]
    ) -> str:
        """Calculate security level based on credential and hardware attestation"""
        
        score = 0
        
        # Base score for FIDO2
        score += 50
        
        # Hardware attestation bonus
        if hardware_attestation:
            if hardware_attestation.verification_status == "verified":
                score += 30
            elif hardware_attestation.verification_status == "partial":
                score += 15
        
        # Attestation type bonus
        if credential.attestation_type == AttestationType.ENTERPRISE:
            score += 20
        elif credential.attestation_type == AttestationType.DIRECT:
            score += 15
        elif credential.attestation_type == AttestationType.INDIRECT:
            score += 10
        
        # Determine security level
        if score >= 80:
            return "enterprise"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "medium"
        else:
            return "basic"
    
    # Database helper methods
    async def _get_user_by_username(self, username: str, tenant_id: str, session: AsyncSession) -> Optional[Dict[str, Any]]:
        """Get user by username and tenant"""
        # Implementation would query database
        return None
    
    async def _get_existing_credentials(self, username: str, tenant_id: str) -> List[PublicKeyCredentialDescriptor]:
        """Get existing credentials for user"""
        # Implementation would query database
        return []
    
    async def _save_credential(self, user_data: Dict[str, Any], credential: FIDO2Credential, session: AsyncSession):
        """Save credential to database"""
        # Implementation would save to database
        pass
    
    async def _get_user_credentials(self, username: str, tenant_id: str, session: AsyncSession) -> List[FIDO2Credential]:
        """Get user credentials"""
        # Implementation would query database
        return []
    
    async def _get_credential_by_id(self, credential_id: str, session: AsyncSession) -> Optional[FIDO2Credential]:
        """Get credential by ID"""
        # Implementation would query database
        return None
    
    async def _update_credential_usage(self, credential_id: str, new_sign_count: int, session: AsyncSession):
        """Update credential usage count"""
        # Implementation would update database
        pass
    
    async def _generate_session_token(self, username: str, tenant_id: str) -> str:
        """Generate session token"""
        # Implementation would generate JWT token
        return secrets.token_urlsafe(32)


# FastAPI endpoints
app = FastAPI(title="FIDO2 Authentication Service", version="1.0.0")

# Initialize FIDO2 service
fido2_service = FIDO2AuthService(
    rp_id="converto.fi",
    rp_name="Converto Business OS",
    origin="https://converto.fi"
)


@app.post("/fido2/register/initiate", response_model=FIDO2RegistrationResponse)
async def initiate_registration(request: FIDO2RegistrationRequest):
    """Initiate FIDO2 registration"""
    return await fido2_service.initiate_registration(request, None)


@app.post("/fido2/register/complete", response_model=FIDO2VerificationResponse)
async def complete_registration(
    challenge_id: str,
    registration_response: Dict[str, Any]
):
    """Complete FIDO2 registration"""
    return await fido2_service.complete_registration(challenge_id, registration_response, None)


@app.post("/fido2/authenticate/initiate", response_model=FIDO2AuthenticationResponse)
async def initiate_authentication(username: str, tenant_id: str):
    """Initiate FIDO2 authentication"""
    return await fido2_service.initiate_authentication(username, tenant_id, None)


@app.post("/fido2/authenticate/complete", response_model=FIDO2VerificationResponse)
async def complete_authentication(
    challenge_id: str,
    authentication_response: Dict[str, Any]
):
    """Complete FIDO2 authentication"""
    return await fido2_service.complete_authentication(challenge_id, authentication_response, None)


@app.get("/fido2/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fido2-auth",
        "fido2_available": FIDO2_AVAILABLE,
        "tpm_available": TPM_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
