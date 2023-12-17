from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dtos.user_base import UserBase, UserRegister, UserResponse
from data.models import User                 # importing Base class model (DB table) 
from data.database import SessionLocal
from validation import validate_user_registration



router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):   # UserRegister is the pydantic BaseModel 
    try:
        validate_user_registration(user_data)
        validate_user_registration(user_data)

        #Creating an instance of the SQLAlchemy model (user object) to add it into db session
        db_user = User(
            username   = user_data.username,
            email      = user_data.email,
            password = user_data.password)                   

        # Adding user 
        db.add(db_user)
        # committing the changes into the Database
        db.commit()
        db.refresh(db_user)

        return {"message": "User registered successfully"}  
      
    except ValueError as ve:
        return {"error": str(ve)}
    

@router.post("/login" )
async def login(user:UserBase,db: Session = Depends(get_db)):
   result= db.query(User).filter(User.username==user.username,User.password==user.password).first()
   if result:
        return result.id
   else:
        raise HTTPException(status_code=401, detail="Username or password incorrect")

@router.get("/{userId}")
async def login(userId:int,db: Session = Depends(get_db)):
   users= db.query(User).filter(User.id!=userId).all()
   user_responses = [UserResponse(id=user.id, email=user.email, username=user.username) for user in users]
   return user_responses 


   

    
