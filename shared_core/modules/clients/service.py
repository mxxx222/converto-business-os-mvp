from __future__ import annotations

from sqlalchemy.orm import Session

from .models import Client


class ClientService:
    def __init__(self, db: Session):
        self.db = db

    def find_by_name(self, name: str) -> list[Client]:
        return self.db.query(Client).filter(Client.name.ilike(f"%{name}%")).all()

