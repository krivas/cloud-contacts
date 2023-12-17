
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from data.database import engine,SessionLocal
from data.models import Base
from sqlalchemy.orm import Session 
from routers import contacts, users
from data import models                #ye line add kari hey

app = FastAPI()

def create_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session,Depends(get_db)]
# Configure CORS to allow requests from your Angular frontend


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/health" ,tags=['Health'])
async def check_health():
    return {"Hello": "World"}


