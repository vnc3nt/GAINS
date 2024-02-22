from flask_restful import Resource
from flask_restful.reqparse import RequestParser
from models import db, users, current_date, token, data
from login import getUsername

post_arguments = RequestParser(bundle_errors=True)
post_arguments.add_argument(
    name = "fat",
    type = int, # 47,5% -> 475
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "weight",
    type = int, # 47,5kg -> 475
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "muscle",
    type = int, # 47,5% -> 475
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "user",
    type = int,# userID
    nullable = False,
    required = True
)


patch_arguments = post_arguments.copy()
patch_arguments.add_argument(
    name = "date",
    type = str, # 10.4.05 -> "10-04-2005"
    nullable = True,
    required = False
)

class Data(Resource):
    def get(self):
        return {"info":"api is there"}, 200
    
    def post(self):  # sourcery skip: extract-method
        givenData = post_arguments.parse_args(strict = True)
        print(givenData)
        USERNAME = getUsername()
        print(USERNAME)
        user = db.session.query(users).filter(users.username == USERNAME).first()
        print(user)
        if user:
            userID = user.id
            existingData = db.session.query(data).filter(data.userid == userID, data.date == current_date()).first()
            print(existingData)
            if existingData is None:
                fat = givenData.fat/10 if givenData.fat is not None else None
                weight = givenData.weight/10 if givenData.weight is not None else None
                muscle = givenData.muscle/10 if givenData.muscle is not None else None
                newData = data(userid = userID, date = current_date(), fat = fat, weight = weight, muscle = muscle)
                #print(newData)
                db.session.add(newData)
            else:
                if givenData.fat is not None:
                    existingData.fat = givenData.fat/10
                if givenData.weight is not None:
                    existingData.weight = givenData.weight/10
                if givenData.muscle is not None:
                    existingData.muscle = givenData.muscle/10
            db.session.commit()
            return {}, 200
        else:
            print("Benutzer nicht gefunden")