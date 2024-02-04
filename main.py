from flask import Flask, render_template, url_for
from models import db
import os

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
print(app.config["SQLALCHEMY_DATABASE_URI"])
db.init_app(app)
@app.route('/')
def index():
    from models import users
    return render_template('home.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("debug", False) == "True")