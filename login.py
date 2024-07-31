from typing import Optional
from models import db,users,token,update_expire_time
import hashlib
from flask import session, redirect
from constants import USERID, TOKEN
from functools import wraps
from time import time

def checkuser(username:str, password:str) -> bool:
    user = db.session.query(users).filter(users.username == username).first()
    if user is None:
        return False
    userpw = user.password
    return userpw == hash_pw(password)

def change_username(new_username: Optional[str]):
    print(new_username)
    if not new_username:  # stops also empty string
        return "Blank/no username"
    
    u = db.session.query(users).filter(users.id == session.get(USERID)).first()
    u.username = new_username
    print("Changed username")
    try:
        db.session.commit()
    except:
        return "Username already exists"
    return None  # no issues


def checkRegistration(username:str, password_1:str, password_2:str) -> bool:
    user = db.session.query(users).filter(users.username == username).first()
    if user is None:
        if password_1 == password_2:
            
            if len(password_1) >= 8:
                
                return True
            else:
                print("less than 8 characters")
        else:
            print("two different passwords")
    else:
        print("noUsername")

    return False

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


def logoutUser(currentToken):
    # token cleanup
    for everySession in db.session.query(token).filter(token.expireTime < time()):
        db.session.delete(everySession)

    if currentToken is None:
        db.session.commit()
        return

    delToken = db.session.query(token).filter(token.token==currentToken).first()
    print(delToken)
    print(currentToken)
    print(session)
    db.session.delete(delToken)
    db.session.commit()
    session.pop(TOKEN)
    session.pop(USERID)
    print(session)
    return redirect("/login")
