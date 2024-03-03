from models import db,users,token,update_expire_time
import hashlib
from flask import session, redirect
from constants import USERID
from functools import wraps

def checkuser(username:str, password:str) -> bool:
    user = db.session.query(users).filter(users.username == username).first()
    if user is None:
        return False
    userpw = user.password
    return userpw == hash_pw(password)


def hash_pw(password:str) -> str:
    return hashlib.sha512(bytes(password, encoding = "utf-8")).hexdigest()

def loginChecker(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        existingToken = db.session.query(token).filter(token.userid == session.get(USERID)).first()
        if existingToken:
            existingToken.expireTime = update_expire_time()
            db.session.commit()
            return redirect("/home")
        else:
            return func(*args, **kwargs)
    return wrapper
        
def validTokenChecker(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        existingToken = db.session.query(token).filter(token.userid == session.get(USERID)).first()
        if existingToken:
            existingToken.expireTime = update_expire_time()
            db.session.commit()
            return func(*args, **kwargs)
        else:
            return redirect("/login")
    return wrapper