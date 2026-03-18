import uuid
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlalchemy import String


class Base(DeclarativeBase):
    pass


def generate_uuid() -> str:
    return str(uuid.uuid4())
