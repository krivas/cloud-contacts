
from pydantic import ValidationError, validator
from sqlalchemy.orm import validates
from dtos.user_base import UserRegister

#@validator('username')
def validate_user_registration(user_data : UserRegister):
    username = user_data.username
    email = user_data.email

    if ' ' in username:
        raise ValueError('username must not contain a space')

    #Email logic defined here
    if  email.endswith('@example.com'):
        raise ValueError("Invalid email domain")
     
    return True

