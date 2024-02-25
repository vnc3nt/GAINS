from flask import Flask, render_template, url_for, redirect, request, jsonify
from models import db, users, token, data
import os
from api import app as api_app
from login import checkuser, getUsername

with open(".env", "r") as f:
    for line in f.readlines():
        if line.strip() and not line.strip().startswith("#"):
            attr, val = line.lstrip().split("=", 1)
            os.environ[attr] = val.rstrip("\n")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://{}.lwanriaqqzgqslcendim:{}@{}:{}/{}".format(
    os.environ.get("uname"),
    os.environ.get("password"),
    os.environ.get("host"),
    os.environ.get("port"),
    os.environ.get("scheme")
)
#print(app.config["SQLALCHEMY_DATABASE_URI"])

app.register_blueprint(api_app)

db.init_app(app)

@app.route('/')
def index():
    return redirect("/login")

@app.route('/login',methods=["GET","POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username_input")
        password = request.form.get("password_input")
        if username is not None and password is not None and checkuser(username, password):
            return redirect("/home")
        
    return render_template('login.html')

@app.route('/home')
def home():
    if getUsername() is None:
        return redirect("/login")
    return render_template('home.html')

@app.route('/edit')
def edit():
    if getUsername() is None:
        return redirect("/login")
    return render_template('edit.html')

#TODO AM BESTEN AUSLAGERN:
@app.route('/getusername', methods=['GET'])
def get_username():
    return jsonify(username=getUsername())

@app.route('/count', methods=['GET'])
def count_entries():  # sourcery skip: use-named-expression
    user = db.session.query(users).filter(users.username == getUsername()).first()
    if user:
        count = db.session.query(data).filter(data.userid == user.id).count()
        #print(count)
        return jsonify(count=count)
    else:
        return jsonify(error="User not found"), 404



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("debug", False) == "True")