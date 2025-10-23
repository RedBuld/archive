from __future__ import annotations

from typing import List, Dict, Any, Self
from datetime import datetime
from sqlalchemy import Table, Column
from sqlalchemy import SmallInteger, Integer, BigInteger, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import Base

from app.models.shared import *
from app.models.user import User



class TeamMember(Base):
    __tablename__ = "teams_members"

    team_id: Mapped[ int ] =\
        Column(
            "team_id",
            BigInteger,
            ForeignKey('teams.id', ondelete="cascade"),
            primary_key=True
        )
    user_id: Mapped[ int ] =\
        Column(
            "user_id",
            BigInteger,
            ForeignKey( "users.id", ondelete="cascade" ),
            primary_key=True
        )
    role: Mapped[ int ] =\
        Column(
            "role",
            BigInteger,
            ForeignKey( "general_team_roles.id", ondelete="cascade" ),
            primary_key=True
        )


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]    = Column(
        "slug",
        Text,
        default=""
    )

    members: Mapped[ List[ User ] ] = relationship(
        "User",
        secondary=TeamMember.__tablename__,
        primaryjoin="foreign(TeamMember.team_id) == Team.id",
        secondaryjoin="foreign(TeamMember.user_id) == User.id",
        lazy=True,
        viewonly=True
    )

    def __repr__(
        self: Self
    ) -> str:
        return f'(Team: id:{self.id}, name:{self.name} slug:{self.slug})'
