from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import random, string

from database import engine, get_db, Base
from models import URL
from schemas import URLCreate, URLResponse, URLStats

Base.metadata.create_all(bind=engine)  # Create table on startup

app = FastAPI()

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://url-shortner-frontend-svvz.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes

# 1. Shorten a URL
@app.post("/shorten", response_model=URLResponse)
def shorten_url(payload: URLCreate, db: Session = Depends(get_db)):
    # Keep generating until we get a unique code
    while True:
        code = generate_short_code()
        exists = db.query(URL).filter(URL.short_code == code).first()
        if not exists:
            break

    url_entry = URL(target_url=payload.target_url, short_code=code)
    db.add(url_entry)
    db.commit()
    db.refresh(url_entry)  # reload from DB to get id, created_at etc.
    return url_entry



# 2. Redirect short code -> original URL
@app.get("/{code}")
def redirect_url(code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL Not found")
    url_entry.clicks += 1
    db.commit()

    return RedirectResponse(url=url_entry.target_url)



# 3. Get stats for a short code
@app.get("/stats/{code}", response_model=URLStats)
def get_stats(code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL Not found")
    return url_entry



# 4. List all URLs (useful for frontend dashboard)
@app.get("/urls/all", response_model=list[URLResponse])
def list_urls(db: Session = Depends(get_db)):
    return db.query(URL).order_by(URL.created_at.desc()).all()


# Helper
def generate_short_code(lenght:int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=lenght))