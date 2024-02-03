from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
def current_date():
    time = datetime.now(timezone.utc)
    return datetime(day=time.day, month=time.month, year=time.year)

class users(db.Model):
    id=db.Column(db.BIGINT, primary_key=True, nullable=False)
    username=db.Column(db.String(30), nullable=False)
    password=db.Column(db.String(128), nullable=False)

class data(db.Model):
    userid=db.Column(db.BIGINT, foreign_key=users.id, nullable=False, primary_key=True)
    date=db.Column(db.DATE, nullable=False, primary_key=True, default=current_date)
    fat=db.Column(db.Numeric(3,1), nullable=True)
    weight=db.Column(db.Numeric(3,1), nullable=True)
    muscle=db.Column(db.Numeric(3,1), nullable=True)
