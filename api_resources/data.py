from flask_restful import Resource
from flask_restful.reqparse import RequestParser

post_arguments = RequestParser(bundle_errors=True)
post_arguments.add_argument(
    name = "fat",
    type = int, # 47,5% -> 4750
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "weight",
    type = int, # 47,5kg -> 4750
    nullable = True,
    required = False
)

post_arguments.add_argument(
    name = "muscle",
    type = int, # 47,5% -> 4750
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
    
    def post(self):
        data = post_arguments.parse_args(strict = True)
        print(data)
        return {}, 200