from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TableSetupRequest(BaseModel):
    table_number: int
    password: str


class TableResponse(BaseModel):
    id: str
    table_number: int

    model_config = {"from_attributes": True}


class TableSessionResponse(BaseModel):
    id: str
    table_id: str
    started_at: datetime
    ended_at: Optional[datetime]
    total_amount: int

    model_config = {"from_attributes": True}


class TableWithSessionResponse(BaseModel):
    id: str
    table_number: int
    current_session: Optional[TableSessionResponse] = None

    model_config = {"from_attributes": True}
