import codecs
import os
import secrets
from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile
import qrcode
from sqlalchemy.orm import Session
from typing import List
from dtos.contact_base import ContactBase
from data.models import Contact
from data.database import SessionLocal
import io
import base64
from sqlalchemy.orm import make_transient

import csv
from io import BytesIO
from fastapi.responses import StreamingResponse
from fastapi import Request, Response               # importing Request and Response classes for getting request from and giving response to client 

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("" ,status_code=status.HTTP_201_CREATED,tags=['Contacts'])
async def post_contact(contact:ContactBase,db: Session = Depends(get_db)):
   contact=Contact(first_name=contact.first_name,
                   last_name=contact.last_name,
                   phone_number=contact.phone_number,
                   phone_type=contact.phone_type,
                   phone_number2=contact.phone_number2,
                   phone_type2=contact.phone_type2,
                   phone_number3=contact.phone_number3,
                   phone_type3=contact.phone_type3,                 
                   email=contact.email,
                   relationship=contact.relationship,
                   user_id=contact.user_id)
   db.add(contact)
   db.commit()
   db.refresh(contact)
   return contact


@router.get("/{user_id}" ,tags=['Contacts'])
async def get_contacts(user_id: int,db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.user_id == user_id,Contact.active==True).all()
    print(user_id)
    print(contacts)
    return contacts

@router.get("/trash/{user_id}" ,tags=['Contacts'])
async def get_contacts_intrash(user_id: int,db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.user_id == user_id, Contact.active==False).all()
    return contacts

@router.delete("/soft/{user_id}/{id}" ,tags=['Contacts'])
async def move_to_trash(user_id: int, id: int,db: Session = Depends(get_db)):
   contact= db.query(Contact).filter(Contact.user_id==user_id,Contact.id==id).first()
   if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
   if contact.active == False:
        raise HTTPException(status_code=400, detail="this Contact is already in your trash")
   else:
       contact.active = False
       db.commit()
       db.close()
       return {"message": "Contact moved to trash"}

@router.put("/recover/{user_id}/{id}" ,tags=['Contacts'])
async def Recover_from_trash(user_id: int, id: int,db: Session = Depends(get_db)):
   contact= db.query(Contact).filter(Contact.user_id==user_id,Contact.id==id).first()
   if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
   if contact.active==True:
       raise HTTPException(status_code=400, detail="already recovered ")
   else:
       contact.active = True
       db.commit()
       db.close()
       return {"message": "Recovery successfull"}

@router.delete("/hard/{user_id}/{id}" ,tags=['Contacts'])
async def permanent_delete(user_id: int, id: int,db: Session = Depends(get_db)):
   contact= db.query(Contact).filter(Contact.user_id==user_id,Contact.id==id).first()
   if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
   if contact.active == True:
        raise HTTPException(status_code=400, detail="Move it to trash first ")
   else:
       db.delete(contact)
       db.commit()
       db.close()
       return {"message": "Contact deleted permanently"}
   

@router.put("/edit/{id}" ,tags=['Contacts'])
def update_contact(id: int, contact_update: ContactBase,db: Session = Depends(get_db)):
    contact=db.query(Contact).filter(Contact.id==id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.first_name=contact_update.first_name
    contact.last_name=contact_update.last_name
    contact.phone_number=contact_update.phone_number
    contact.phone_type=contact_update.phone_type
    contact.phone_number2=contact_update.phone_number2
    contact.phone_type2=contact_update.phone_type2
    contact.phone_number3=contact_update.phone_number3
    contact.phone_type3=contact_update.phone_type3
    contact.relationship=contact_update.relationship
    contact.email=contact_update.email
    db.commit()
    db.refresh(contact)
    db.close()
    return contact

@router.get("/{user_id}/{id}" ,tags=['Contacts'])
async def get_contacts_by_user_id_and_contact_id(user_id: int,id:int,db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.user_id == user_id,Contact.id==id,Contact.active==True).first()
    return contacts

@router.post("/create/whatsapp/barcode" ,tags=['Contacts'])
async def get_contacts_by_user_id_and_contact_id(phone_number:str,db: Session = Depends(get_db)):
  if ('809' in phone_number):
    phone_number= f"1{phone_number}"
  else:
    phone_number= f"39{phone_number}"
  url= f"https://wa.me/{phone_number}"
  data = url
  img = qrcode.make(data)

  img_byte_array = io.BytesIO()
  img.save(img_byte_array, format='PNG')
  img_byte_array = img_byte_array.getvalue()
  base64_image = base64.b64encode(img_byte_array).decode('utf-8')
  return base64_image

@router.post("/share/{contact_id}" ,tags=['Contacts'])
async def share_contact(user_ids: List[int],contact_id:int, db: Session = Depends(get_db)):
  print("contact_id ",contact_id)
  print("ids ",user_ids)
  for user_id in user_ids:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()

        if contact:
            make_transient(contact)
            new_contact = Contact(
            user_id=user_id,
            first_name=contact.first_name,
            last_name=contact.last_name,
            email=contact.email,
            phone_number=contact.phone_number,
            phone_type=contact.phone_type,
            phone_number2=contact.phone_number2,
            phone_type2=contact.phone_type2,
            phone_number3=contact.phone_number3,
            image_path=contact.image_path,
            phone_type3=contact.phone_type3,
            relationship=contact.relationship,
            is_shared=True
        )
            db.add(new_contact)
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Contact with ID {user_id} not found",
            )
  db.commit()
  db.close()
  return "successfully shared!"
  

@router.get("/download-contacts", tags=['downlaod contacts'])
async def download_contacts(db: Session = Depends(get_db), request = Request):

    cursor = db.execute("SELECT * from Contact")
    all_contactcs = cursor.fetchall()

    #converting contacts into csv format
    contacts_csv = BytesIO()                      # BytesIO object
    csv_writer  = csv.writer(contacts_csv)        # csv.writer class is used to insert the data into csv file. User’s data is converted into a delimited string by the writer object returned by csv.writer()

    for row in all_contactcs:
        csv_writer.writerow(row)                  # writerow() method is used to write single row of data to csv file. 
    
    response = StreamingResponse(contacts_csv, media_type="applicaton/octet-stream")    #applicaton/octet-stream 
    response.headers["Content disposition"] = "attachment; filename=contacts.csv"

    return response

@router.get("/profile/photo/{contact_id}",tags=['Contacts'])
async def get_profile_photo(contact_id,db: Session = Depends(get_db)):
    print("ID ",contact_id)
    contact= db.query(Contact).filter(Contact.id==contact_id,Contact.active==True).first()
    file_path=contact.image_path
    _, extension = os.path.splitext(file_path)
    with open(file_path, "rb") as file:
        binary_data=file.read()
        image=base64.b64encode(binary_data).decode('utf-8')
        return {"image": image, "extension": extension[1:]}  



@router.put("/upload/profile/{contactId}")
async def create_upload_profile(contactId:int,file: UploadFile = File(...),db: Session = Depends(get_db)):
    contact= db.query(Contact).filter(Contact.id==contactId,Contact.active==True).first()
    print("file... ",file)
    filepath="./profile/images/"
    file_name=file.filename
    # extension=file_name.split(".")[1]
    _, extension = os.path.splitext(file_name)
    
    extension = extension[1:]
    print("extension: ",extension)

    if extension not in  ["jpg", "png", "jpeg"]:
        return {"status": "error", "detail": "file extension not allowed"}
    global_token_name=secrets.token_hex(10)+"."+extension
    generated_name=filepath+global_token_name
    print("FILEPATH: ",filepath)
    print("NAME: ",generated_name)
    file_content = await file.read()
    with open(generated_name, "wb") as file:
        file.write(file_content)
    file.close()
    contact.image_path=generated_name
    db.commit()
    db.refresh(contact)
    db.close()
    return "successfuly uploaded"

@router.post("/upload/csv/{userId}")
def upload(userId:int,file: UploadFile = File(...),db: Session = Depends(get_db)):
    csvReader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
    for row in csvReader:
        contact=Contact(first_name=row["first_name"],
                   last_name=row["last_name"],
                   phone_number=row["phone_number"],
                   phone_type=row["phone_type"],
                   phone_number2=row["phone_number2"],
                   phone_type2=row["phone_type2"],
                   phone_number3=row["phone_number3"],
                   phone_type3=row["phone_type3"],                 
                   email=row["email"],
                   relationship=row["relationship"],
                   user_id=userId)
        db.add(contact)
    file.file.close()
    db.commit()
    db.close
    return "contacts uploaded successfully"



    
    

