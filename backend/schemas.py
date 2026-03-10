from pydantic import BaseModel
from datetime import datetime

class URLCreate(BaseModel):
    target_url: str

class URLResponse(BaseModel):
    short_code: str
    target_url: str
    clicks: int
    created_at: datetime

    model_config = {"from_attributes": True}  # allows ORM model → Pydantic

class URLStats(URLResponse):  # Inherits everything from URLResponse
    pass