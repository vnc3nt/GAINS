from models import db,users
import hashlib

USERNAME = None

def checkuser(username:str, password:str) -> bool:
    user = db.session.query(users).filter(users.username == username).first()
    if user is None:
        return False
    global USERNAME
    USERNAME = username
    print(f"login: {USERNAME}")
    userpw = user.password
    return userpw == hash_pw(password)


def hash_pw(password:str) -> str:
    return hashlib.sha512(bytes(password, encoding = "utf-8")).hexdigest()

def getUsername():
    return USERNAME