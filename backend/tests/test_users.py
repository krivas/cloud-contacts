from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from data.models import User
from routers.users import get_db
from main import app

client = TestClient(app)

def test_login_correct_username_password():

    url="/users/login"
    user={"username":"Giovanni",
          "password":"Rossi"}
    
    mock_db_session = MagicMock()
    mock_query = MagicMock()
    
    mock_query.filter.return_value.first.return_value = User( id= 2 ,username= "Giovanni",password= "Rossi")
    mock_db_session.query.return_value = mock_query

    app.dependency_overrides[get_db] = lambda:mock_db_session
    response = client.post(url, json=user)
    assert response.status_code == 200
    assert response.json() == 2

def test_login_incorrect_username_password():

    url="/users/login"
    user={"username":"Giovanni",
          "password":"Rossi"}
    
    mock_db_session = MagicMock()
    mock_query = MagicMock()
    
    mock_query.filter.return_value.first.return_value = None
    mock_db_session.query.return_value = mock_query

    app.dependency_overrides[get_db] = lambda:mock_db_session
    response = client.post(url, json=user)
    assert response.status_code == 401
    response_json = response.json()
    assert "detail" in response_json
    assert response_json["detail"] == "Username or password incorrect"

def test_user_registration_success( ):
    url = "/users/register"
    user={"username":"Hasan",
           "email":"Hasan@gmail.com",
          "password":"password123"}
    mock_db_session = MagicMock()
    app.dependency_overrides[get_db] = lambda:mock_db_session

    response = client.post(url, json=user)
    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully"}

    mock_db_session.add.assert_called()
    mock_db_session.commit.assert_called()
    mock_db_session.refresh.assert_called()

def test_get_all_users():

    url="/users/1"
    
    mock_db_session = MagicMock()
    mock_query = MagicMock()
    
    mock_query.filter.return_value.all.return_value = [User( id= 2 ,username= "Giovanni",email="giovanni@gmail.com",password= "Rossi"),
                                                         User( id= 3 ,username= "Kevin",email="krivas@gmail.com",password= "Rossi")]
    mock_db_session.query.return_value = mock_query

    app.dependency_overrides[get_db] = lambda:mock_db_session
    response = client.get(url)
    assert response.status_code == 200
    assert response.json() == [
        {"id":2 ,"email":"giovanni@gmail.com","username":"Giovanni"}, 
        {"id": 3 ,"email":"krivas@gmail.com","username": "Kevin"}
        ]
    
        
    



   


