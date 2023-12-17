from unittest.mock import MagicMock, patch
from data.models import Contact
from fastapi.testclient import TestClient
from routers.contacts import get_db
from main import app
 

client = TestClient(app)

def test_create_contact_with_3_phone_numbers(mock_db_session: MagicMock):
    url="/contacts"
    contact={"first_name":"Giovanni",
             "last_name":"Rossi",
             "email":"giovanni@gmail.com",
             "phone_number":"1234567890" ,
             "phone_number2":"0234567890" ,
             "phone_number3":"5234567890" ,
             "user_id":1
             }

    response = client.post(url, json=contact)

    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "Giovanni"
    assert data["last_name"] == "Rossi"
    assert data["phone_number"] == "1234567890"
    assert data["phone_number2"] == "0234567890"
    assert data["phone_number3"] == "5234567890"
    assert data["email"] == "giovanni@gmail.com"

    mock_db_session.add.assert_called()
    mock_db_session.commit.assert_called()
    mock_db_session.refresh.assert_called()

def test_create_contact(mock_db_session: MagicMock):
    url="/contacts"
    contact={"first_name":"Giovanni",
             "last_name":"Rossi",
             "email":"giovanni@gmail.com",
             "phone_number":"1234567890" ,
             "user_id":1
             }

    response = client.post(url, json=contact)

    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "Giovanni"
    assert data["last_name"] == "Rossi"
    assert data["phone_number"] == "1234567890"
    assert data["email"] == "giovanni@gmail.com"


    mock_db_session.add.assert_called()
    mock_db_session.commit.assert_called()
    mock_db_session.refresh.assert_called()


   

def test_create_without_user_id(mock_db_session: MagicMock):
    url="/contacts"
    contact={"first_name":"Giovanni",
             "last_name":"Rossi",
             "email":"giovanni@gmail.com",
             "phone_number":"1234567890" ,
             }

    response = client.post(url, json=contact)
    assert response.status_code == 422

def test_create_without_phone_number(mock_db_session: MagicMock):
    url="/contacts"
    contact={"first_name":"Giovanni",
             "last_name":"Rossi",
             "email":"giovanni@gmail.com",
             "user_id":1
             }

    response = client.post(url, json=contact)
    assert response.status_code == 422


def test_get_contacts(mock_db_session: MagicMock):
    mock_query=mock_db_session
    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = [
    {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "active": True
    }
    ]

    mock_db_session.query.return_value = mock_query

   # app.dependency_overrides[get_db] = lambda:mock_db_session
    response = client.get("/contacts/1")
    assert response.status_code == 200
    assert response.json() == [
    {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "active":True
    }
    ]
   
   
def test_get_empty_contacts(mock_db_session):

    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = []

    mock_db_session.query.return_value = mock_query

    app.dependency_overrides[get_db] = lambda:mock_db_session
    response = client.get("/contacts/1")
    assert response.status_code == 200
    assert response.json() == []

def test_soft_delete_not_found(mock_db_session):

    mock_query = mock_db_session
    mock_query.query.return_value.filter.return_value.first.return_value = None

    response = client.delete("/contacts/soft/1/1")
    assert response.status_code == 404
    assert response.json()=={
        "detail":"Contact not found"
    }

def test_soft_delete_when_contact_active_false(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=False)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.delete("/contacts/soft/1/1")
    assert response.status_code == 400
    assert response.json()=={
        "detail":"this Contact is already in your trash"
    }

def test_soft_delete_move_to_trash(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=True)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.delete("/contacts/soft/1/1")

    mock_db_session.commit.assert_called()
    mock_db_session.close.assert_called()

    assert response.status_code == 200
    assert response.json()=={
        "message": "Contact moved to trash"
    }

def test_get_trash_contacts(mock_db_session: MagicMock):
    mock_query=mock_db_session
    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = [
    {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "phone_number2":None,
        "phone_number3":None,
        "active": False
    }
    ]

    mock_db_session.query.return_value = mock_query

    response = client.get("/contacts/trash/1")
    assert response.status_code == 200
    assert response.json() == [
    {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "phone_number2":None,
        "phone_number3":None,
        "active":False
    }
    ]


def test_recover_from_trash_not_found(mock_db_session):

    mock_query = mock_db_session
    mock_query.query.return_value.filter.return_value.first.return_value = None

    response = client.put("/contacts/recover/1/1")
    assert response.status_code == 404
    assert response.json()=={
        "detail":"Contact not found"
    }

def test_recover_contact_when_contact_active_true(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=True)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.put("/contacts/recover/1/1")
    assert response.status_code == 400
    assert response.json()=={
        "detail":"already recovered "
    }

def test_recover_from_trash_successfully(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=False)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.put("/contacts/recover/1/1")

    mock_db_session.commit.assert_called()
    mock_db_session.close.assert_called()

    assert response.status_code == 200
    assert response.json()=={
        "message": "Recovery successfull"
    }
   
def test_hard_delete_not_found(mock_db_session):

    mock_query = mock_db_session
    mock_query.query.return_value.filter.return_value.first.return_value = None

    response = client.delete("/contacts/hard/1/1")
    assert response.status_code == 404
    assert response.json()=={
        "detail":"Contact not found"
    }

def test_hard_delete_contact_not_in_trash(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=True)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.delete("/contacts/hard/1/1")
    assert response.status_code == 400
    assert response.json()=={
        "detail":"Move it to trash first "
    }

def test_hard_delete_successfully(mock_db_session):

    mock_query = mock_db_session
    contact=Contact( id= 1 ,first_name= "Giovanni",last_name= "Rossi",active=False)
    mock_query.query.return_value.filter.return_value.first.return_value = contact

    response = client.delete("/contacts/hard/1/1")
    
    mock_db_session.delete.assert_called()
    mock_db_session.commit.assert_called()
    mock_db_session.close.assert_called()

    assert response.status_code == 200
    assert response.json()=={
        "message": "Contact deleted permanently"
    }

def test_update_contact(mock_db_session: MagicMock):
        
    contact = Contact(
        first_name="Giovanni",
        last_name="Rossi",
        email="giovanni@gmail.com",
        phone_number="1234567890",
        phone_type=None,
        phone_number2=None,
        phone_type2=None,
        phone_number3=None,
        phone_type3=None,
        relationship=None,
        user_id=1
    )
    
    update_contact = {
        "first_name": "Getachew",
        "last_name": "Ross",
        "email": "getachew@gmail.com",
        "phone_number": "0123456789",
        "phone_type": "Mobile",
        "phone_number2": "0123456788",
        "phone_type2": "Work",
        "phone_number3": "0123456787",
        "phone_type3": "Home",
        "relationship":" Family",
        "user_id": 1
    }
    
    mock_query = mock_db_session
    mock_query.query.return_value.filter.return_value.first.return_value = contact
    response = client.put("/contacts/edit/1", json=update_contact)
    assert response.status_code == 200
    assert response.json() == {
        "first_name": "Getachew",
        "last_name": "Ross",
        "email": "getachew@gmail.com",
        "phone_number": "0123456789",
        "phone_type": "Mobile",
        "phone_number2": "0123456788",
        "phone_type2": "Work",
        "phone_number3": "0123456787",
        "phone_type3": "Home",
        "relationship":" Family",
        "user_id": 1
    }
def test_update_contact_not_found(mock_db_session):
    mock_query = mock_db_session
    mock_query.query.return_value.filter.return_value.first.return_value = None
    
    update_contact={"first_name":"Getachew",
             "last_name":"Ross",
             "email":"getachew@gmail.com",
             "phone_number":"0123456789" ,
             "user_id":1
             }
    response = client.put("/contacts/edit/1",json=update_contact)
    assert response.status_code == 404
    assert response.json()=={"detail":"Contact not found"}

def test_get_contact_user_id_and_contact_id(mock_db_session):
    mock_query=mock_db_session
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "phone_number2":None,
        "phone_number3":None,
        "active": True
    }
    

    mock_db_session.query.return_value = mock_query

    response = client.get("/contacts/1/68")
    assert response.status_code == 200
    assert response.json() == {
        "last_name": "Rossi",
        "id": 68,
        "phone_number": "1234567890",
        "email": "giovanni@gmail.com",
        "user_id": 1,
        "first_name": "Giovanni",
        "phone_number2":None,
        "phone_number3":None,
        "active": True
    }

def test_create_whatsapp_barcode():
    phone_number = "8091234567" 

    response = client.post(
        f"/contacts/create/whatsapp/barcode?phone_number={phone_number}"
    )
    assert response.status_code == 200

