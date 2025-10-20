import math
import random
from fastapi import Response

def update_db():
    from app.db import engine, Base
    from app import models
    Base.metadata.create_all( bind=engine, checkfirst=True )

def get_session():
    from app.db import DB
    with DB() as session:
        yield session

def generateOTP():
    digits = "0123456789"
    OTP = ""

    for i in range(6):
        OTP += digits[ math.floor( random.random() * 10 ) ]
 
    return OTP

class PJSONResponse( Response ):
    media_type = "application/json"

    def render( self, content: str|bytes ) -> bytes:
        if isinstance( content, bytes ):
            return content
        return content.encode( self.charset )