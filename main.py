from flask import Flask, render_template, url_for
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('home.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.access(".debug", os.R_OK))