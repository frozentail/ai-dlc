from pydantic import BaseModel, field_validator


class AdminLoginRequest(BaseModel):
    store_identifier: str
    username: str
    password: str


class TableLoginRequest(BaseModel):
    store_identifier: str
    table_number: int
    password: str


class AdminSetupRequest(BaseModel):
    store_identifier: str
    store_name: str
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("비밀번호는 6자 이상이어야 합니다")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TableTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    session_id: str
    table_number: int
    store_id: str
    table_id: str
