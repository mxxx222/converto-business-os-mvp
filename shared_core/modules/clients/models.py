from __future__ import annotations

import uuid
from typing import Callable

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from ...utils.db import Base, engine


def _uuid_factory(use_native: bool) -> Callable[[], object]:
    def _factory() -> object:
        value = uuid.uuid4()
        return value if use_native else str(value)

    return _factory


USE_NATIVE_UUID = engine.url.get_backend_name().startswith("postgres")
UUID_TYPE = PG_UUID(as_uuid=True) if USE_NATIVE_UUID else String(36)
UUID_DEFAULT = _uuid_factory(USE_NATIVE_UUID)


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    name = Column(String(255), nullable=False)
    vat_number = Column(String(32), nullable=True)
    netvisor_customer_id = Column(String(64), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

