from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker 
from sqlalchemy.orm import declarative_base

URL_DATABASE='mysql+pymysql://superuser:Cloudcontacts.@cloudcontactserver.mysql.database.azure.com:3306/cloudcontactsapp'
engine = create_engine(URL_DATABASE)
SessionLocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base=declarative_base()
