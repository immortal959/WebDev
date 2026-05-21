import sys
import json

from points.point import Point
from buildings.building import Building
from streets.street import Street


def main():
    # sys.argv[0] es siempre el nombre del archivo (main.py)
    # Por eso verificamos que haya al menos 3 elementos (nombre + p1 + p2)
    # everything after python is counted as arg so "python main.py buildings insert" has 3 arguments
    if len(sys.argv) == 4:
        tableName = sys.argv[1]
        functionName = sys.argv[2]
        data = json.loads(sys.argv[3])
    else:
        print("Error: You mus give two parameters tableName and functionName to execute the addecuate function.")
        sys.exit(0)


    if tableName not in ["buildings", "points", "streets"]:
        print("Error: The available table names are buildings, points, streets")
        sys.exit(0)
    
    if functionName not in ["insert", "select_as_dict","select_as_tuple","update", "delete"]:
        print("Error the available function names are insert, select_as_dict, select_as_tuple, delete or update")
        sys.exit(0)

    if tableName == "points":
        point = Point()
        if functionName=="insert":
            print(point.insert(data))
        elif functionName=="select_as_dict":
            print(point.select_as_dict(data))
        elif functionName=="select_as_tuple":
            print(point.select_as_tuple(data))
        elif functionName=="update":
            print(point.update(data))
        elif functionName=="delete":
            print(point.delete(data))
    elif tableName=="buildings":
        building = Building()
        if functionName=="insert":
            print(building.insert(data))
        elif functionName=="select_as_dict":
            print(building.select_as_dict(data))
        elif functionName=="select_as_tuple":
            print(building.select_as_tuple(data))
        elif functionName=="update":
            print(building.update(data))
        elif functionName=="delete":
            print(building.delete(data))
    elif tableName=="streets":
        street = Street()
        if functionName=="insert":
            print(street.insert(data))
        elif functionName=="select_as_dict":
            print(street.select_as_dict(data))
        elif functionName=="select_as_tuple":
            print(street.select_as_tuple(data))
        elif functionName=="update":
            print(street.update(data))
        elif functionName=="delete":
            print(street.delete(data))

if __name__ == "__main__":
    main()