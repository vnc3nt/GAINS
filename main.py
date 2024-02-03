from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://{}:{}@{}:{}/{}?sslmode=require".format(
    os.environ.get("uname"),
    os.environ.get("password"),
    os.environ.get("host"),
    os.environ.get("port"),
    os.environ.get("scheme")
)
print(app.config["SQLALCHEMY_DATABASE_URI"])
db = SQLAlchemy(app)
from models import users 
@app.route('/')
def index():
    return users.query.all()
    return render_template('home.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("debug", False) == True)