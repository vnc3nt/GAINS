from models import db,users
import hashlib

USERNAME = None

def checkuser(username:str, password:str) -> bool:
    user = db.session.query(users).filter(users.username == username).first()
    if user is None:
        return False
    global USERNAME
    USERNAME = username
    print(USERNAME)
    userpw = user.password
    if userpw == hash_pw(password):
        return True
    return False


def hash_pw(password:str) -> str:
    return hashlib.sha512(bytes(password, encoding = "utf-8")).hexdigest()

def getUsername():
    return USERNAME