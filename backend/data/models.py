
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from data.database import Base

class User(Base):
   __tablename__='users'

   id=Column(Integer,primary_key=True,index=True)
   username=Column(String(50),unique=True)
   email=Column(String(50),unique=True)
   password=Column(String(50))
 

class Contact(Base):
   __tablename__='contacts'

   id=Column(Integer,primary_key=True,index=True)
   user_id=Column("user_id", Integer, ForeignKey("users.id"), nullable=False)
   first_name=Column(String(50))
   last_name=Column(String(50))
   email=Column(String(50))
   phone_number=Column(String(50))
   phone_type = Column(String(50),nullable=True)
   phone_number2=Column(String(50),nullable=True)
   phone_type2 = Column(String(50),nullable=True)
   phone_number3=Column(String(50),nullable=True)
   phone_type3 = Column(String(50),nullable=True)
   relationship = Column(String(50),nullable=True)
   active=Column(Boolean, default=True)
   is_shared=Column(Boolean,default=False)
   image_path=Column(String(100),nullable=True)
