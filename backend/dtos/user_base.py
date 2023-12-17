
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
   username:str
   password:str

class UserRegister(BaseModel):
   username: str
   email:    EmailStr
   password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
