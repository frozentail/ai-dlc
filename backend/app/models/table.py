from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.base import Base, generate_uuid


class Table(Base):
    __tablename__ = "tables"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    store_id: Mapped[str] = mapped_column(String(36), ForeignKey("stores.id"), nullable=False)
    table_number: Mapped[int] = mapped_column(Integer, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    store: Mapped["Store"] = relationship("Store", back_populates="tables")
    sessions: Mapped[list["TableSession"]] = relationship(
        "TableSession", back_populates="table", cascade="all, delete-orphan", passive_deletes=True
    )


class TableSession(Base):
    __tablename__ = "table_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    table_id: Mapped[str] = mapped_column(String(36), ForeignKey("tables.id", ondelete="CASCADE"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_amount: Mapped[int] = mapped_column(Integer, default=0)

    table: Mapped["Table"] = relationship("Table", back_populates="sessions")
    orders: Mapped[list["Order"]] = relationship(
        "Order", back_populates="session", cascade="all, delete-orphan", passive_deletes=True
    )
