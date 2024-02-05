from flask import Flask, render_template, url_for, redirect, request
from models import db, users, token, data
import os
from api import app as api_app
from login import checkuser

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
@app.route('/',methods=["GET","POST"])
def index():
    if request.method == "POST":
        username = request.form.get("username_input")
        password = request.form.get("password_input")
        if username is not None and password is not None:
            if checkuser(username, password):
                return redirect("/home")
        
    return render_template('login.html')

@app.route('/home')
def home():
    return render_template('home.html')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("debug", False) == "True")