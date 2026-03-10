from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from datetime import datetime, UTC

class URL(Base):
    __tablename__ = "urls"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    target_url: Mapped[str] = mapped_column(index=True)
    short_code: Mapped[str] = mapped_column(unique=True, index=True)
    clicks: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(UTC))