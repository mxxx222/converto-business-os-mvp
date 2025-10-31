from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...utils.db import get_session
from .models import Client


router = APIRouter(prefix="/api/v1/clients", tags=["clients"])


class ClientCreate(BaseModel):
    name: str
    vat_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    netvisor_customer_id: Optional[str] = None


class ClientOut(BaseModel):
    id: str
    name: str
    vat_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    netvisor_customer_id: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ClientOut])
def list_clients(db: Session = Depends(get_session)):
    rows = db.query(Client).order_by(Client.created_at.desc()).all()
    return rows


@router.post("/", response_model=ClientOut)
def create_client(payload: ClientCreate, db: Session = Depends(get_session)):
    c = Client(
        name=payload.name,
        vat_number=payload.vat_number,
        email=payload.email,
        phone=payload.phone,
        netvisor_customer_id=payload.netvisor_customer_id,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: str, db: Session = Depends(get_session)):
    c = db.get(Client, client_id)
    if not c:
        raise HTTPException(404, "not_found")
    return c


@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: str, payload: ClientCreate, db: Session = Depends(get_session)):
    c = db.get(Client, client_id)
    if not c:
        raise HTTPException(404, "not_found")
    for k, v in payload.dict().items():
        setattr(c, k, v)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_session)):
    c = db.get(Client, client_id)
    if not c:
        raise HTTPException(404, "not_found")
    db.delete(c)
    db.commit()
    return {"ok": True}

