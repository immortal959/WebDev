import json

from scripts.p1.poiDjangoModels.poi import Point
from scripts.p1.buildingsDjangoModels.building import Building
from scripts.p1.streetsDjangoModels.street import Street


def run(*args):


    # check all the args for validtity
    if len(args) == 3:
        table_name = args[0]
        function_name = args[1]
        data = json.loads(args[2])
    else:
        print("Error: You must give tableName, functionName and data")
        return
    if table_name not in ["buildings", "points", "streets"]:
        print("Error: The available table names are buildings, points, streets")
        return
    if function_name not in ["insert", "select_as_dict","select_as_tuple","update", "delete"]:
        print("Error the available function names are insert, select_as_dict, select_as_tuple, delete or update")
        return

    if table_name == "buildings":
        building = Building()
        if function_name=="insert":
            print(building.insert(data))
        elif function_name=="select_as_dict":
            print(building.select_as_dict(data))
        elif function_name=="update":
            print(building.update(data))
        elif function_name=="delete":
            print(building.delete(data))
    elif table_name == "streets":
        street = Street()
        if function_name=="insert":
            print(street.insert(data))
        elif function_name=="select_as_dict":
            print(street.select_as_dict(data))
        elif function_name=="update":
            print(street.update(data))
        elif function_name=="delete":
            print(street.delete(data))
    elif table_name == "points":
        point = Point()
        if function_name=="insert":
            print(point.insert(data))
        elif function_name=="select_as_dict":
            print(point.select_as_dict(data))
        elif function_name=="update":
            print(point.update(data))
        elif function_name=="delete":
            print(point.delete(data))