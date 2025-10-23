from __future__ import annotations

from typing import List, Dict, Any, Self
from datetime import date, datetime
from email.policy import default
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy import Table, Column
from sqlalchemy import SmallInteger, Integer, BigInteger, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import DB
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int]                               = Column("id", BigInteger, primary_key=True)
    email: Mapped[str]                            = Column("email", String(250), unique=True, index=True)
    hashed_password: Mapped[str]                  = Column("hashed_password", String(250))
    activation_code: Mapped[str | None]           = Column("activation_code", String(6), nullable=True)
    is_active: Mapped[bool]                       = Column("is_active", SmallInteger, default=False)
    role: Mapped[int]                             = Column("role", Integer, default=1)

    def __repr__(
        self: Self
    ) -> str:
        return f'(User: #{self.id}, {self.email} [{self.role}])'