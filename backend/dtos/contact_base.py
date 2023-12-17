from pydantic import BaseModel
from typing import Optional

class ContactBase(BaseModel):
   first_name:str
   last_name:str
   email:str
   phone_number:str
   phone_type: Optional[str] = None
   phone_number2: Optional[str] = None 
   phone_type2: Optional[str] = None
   phone_number3: Optional[str] = None
   phone_type3: Optional[str] = None
   relationship: Optional[str] = None
   user_id:int