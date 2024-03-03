from flask_restful import Resource
from flask_restful.reqparse import RequestParser
from flask import json, jsonify, session
from sqlalchemy import text
from models import db, users, current_date, token, data
from datetime import datetime
from decimal import Decimal
from constants import USERID

#TODO export und import der Daten -> Backup

post_arguments = RequestParser(bundle_errors=True)
post_arguments.add_argument(
    name = "fat",
    type = float, # 47,55
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "weight",
    type = float, # 47,52
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "muscle",
    type = float, # 47,54
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "user",
    type = float,# userID
    nullable = False,
    required = True
)


patch_arguments = post_arguments.copy()
patch_arguments.add_argument(
    name = "date",
    type = str, # 2005-04-10
    nullable = True,
    required = False
)

class Data(Resource):
    def get(self):
        existingData = db.session.query(data).filter(data.userid == session.get(USERID)).order_by(data.date).all()
        output = [
            {
                'userid': i.userid,
                'date': datetime.strftime(i.date, "%d-%m-%Y"),
                'fat': float(i.fat) if i.fat is not None else None,
                'weight': float(i.weight) if i.weight is not None else None,
                'muscle': float(i.muscle) if i.muscle is not None else None,
            }
            for i in existingData
        ]
        return {
            "maxValue": list(map(
                lambda v : float(v) if isinstance(v, Decimal) and v is not None else v,
                db.session.execute(text("select max(muscle), max(weight), max(fat) from data inner join users on users.id=data.userid where users.id=%s" % session.get(USERID))).first()
            )),
            "data": output
        }, 200
    
    def post(self):
        givenData = post_arguments.parse_args(strict = True)
        print(givenData)
        user = db.session.query(users).filter(users.id == session.get(USERID)).first()
        print(user)
        if user:
            userID = user.id
            existingData = db.session.query(data).filter(data.userid == userID, data.date == current_date()).first()
            print(existingData)
            if existingData is None:
                fat = givenData.fat if givenData.fat is not None else None
                weight = givenData.weight if givenData.weight is not None else None
                muscle = givenData.muscle if givenData.muscle is not None else None
                newData = data(userid = userID, date = current_date(), fat = fat, weight = weight, muscle = muscle)
                #print(newData)
                db.session.add(newData)
            else:
                if givenData.fat is not None:
                    existingData.fat = givenData.fat
                if givenData.weight is not None:
                    existingData.weight = givenData.weight
                if givenData.muscle is not None:
                    existingData.muscle = givenData.muscle
            db.session.commit()
            return {}, 200
        else:
            print("Benutzer nicht gefunden")