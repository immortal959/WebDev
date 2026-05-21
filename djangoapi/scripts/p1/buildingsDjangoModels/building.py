from erasmus_valencia.models import Building as BuildingModel
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry

from django.db import connection

from djangoapi.settings import EPSG_FOR_GEOMETRIES, ST_SNAP_PRECISION


class Building:

    def _intersects(self, geom:GEOSGeometry, exclude_id: int = None) -> list:
        '''
        Checks if the geometry intersects with any other geometry in the building table. 
        If it intersects return a list of the ids of the intersecting buildings, if it does not intersect return an empty list
        '''
        #check if the geometry intersects any existing building
        cursor=connection.cursor()

        query = """
            SELECT id FROM erasmus_valencia_building 
            WHERE ST_Intersects(
                geom,
                ST_GeomFromText(%s, %s)
            )
        """
        cursor.execute(query, [geom.wkt, EPSG_FOR_GEOMETRIES])
        result = cursor.fetchall()

        return result


    def _check_overlap(self, geom:GEOSGeometry, exclude_id: int = None) -> bool:
        # check if the geometry overlaps with any other geometry in the building table
        # if it overlaps return true, if it does not overlap return false
        buildings = BuildingModel.objects.all()
        if exclude_id is not None:
            buildings = buildings.exclude(id=exclude_id)
        for building in buildings:
            if building.geom.overlaps(geom):
                return True
        return False
    
    def _snap_to_grid(self, geom:GEOSGeometry) -> GEOSGeometry:
        '''
        Snap the geometry to a grid similiar to ST_SnapToGrid in postgis. The Code is from the profs pdf
        '''
        cursor=connection.cursor()
        query="select st_snaptogrid(st_geomfromtext(%s, %s),%s)"
        cursor.execute(query, [geom.wkt, EPSG_FOR_GEOMETRIES, ST_SNAP_PRECISION])

        return GEOSGeometry(cursor.fetchall()[0][0], srid=EPSG_FOR_GEOMETRIES)


    def insert(self, data:dict) -> dict:

        try: 
            # building_model is the instance of the BuildingModel class, which is the model of the building table in the database
            # we convert our building class to the building model and then we save it to the database
            building_model = BuildingModel()
            building_model.description = data['description']
            building_model.name = data['name']
            building_model.floors = data['floors']
            building_model.height = data['height']
            building_model.category = data['category']
            building_model.visitedAt = data['visitedAt']

            # check if the geom is valid, if it is not valid return an error message
            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            # snap the geometry to a grid similiar to ST_SnapToGrid in postgis
            geom= self._snap_to_grid(geom)
            building_model.geom = geom

            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }

            intersections = self._intersects(geom)

            if len(intersections) > 0:
                return {
                    "ok": False,
                    "message": "The geometry intersects with other building(s) with the id(s) in data",
                    "data": intersections
                }
            
        
            building_model.save()

            return {'ok':True, 'message':'Building inserted', 'data':[{'id':building_model.id}]}
        
        except Exception as e:

            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}


    def update(self, data:dict) -> dict:

        try:
            id= data['id']
            # get the buidlingModel instance with the id of the building we want to update
            building_model=list(BuildingModel.objects.filter(id=id))[0]

            # update all the data
            building_model.description = data['description']
            building_model.name = data['name']
            building_model.floors = data['floors']
            building_model.height = data['height']
            building_model.category = data['category']
            building_model.visitedAt = data['visitedAt']

            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            # snap the geometry to a grid similiar to ST_SnapToGrid in postgis
            geom = self._snap_to_grid(geom)


             # check if the geom is valid, if it is not valid return an error message
            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }
            
            intersections = self._intersects(geom, exclude_id=id)

            if len(intersections) > 0:
                return {
                    "ok": False,
                    "message": "The geometry intersects with other building(s) with the id(s) in data",
                    "data": intersections
                }

            building_model.geom = geom

            # exclude the objects own id for the overlap check, otherwise it will always overlap with itself
            if self._check_overlap(geom, exclude_id=id):
                return {
                    "ok": False,
                    "message": "The geometry overlaps with another building",
                    "data": []
                }

            # save the updated building to the database
            building_model.save()
            return {'ok':True, 'message':'Data updated', 'data':[{'rows_updated':1}]}
        except Exception as e:
            return {'ok':False, 'message':str(e), 'data':[]}
    

    def delete(self, data:dict) -> dict:

        id = data['id']
        try:
            building = list(BuildingModel.objects.filter(id=id))[0]
            building.delete()
            return {'ok':True, 'message':'Data deleted', 'data':[{'rows_deleted':1}]}
        except Exception as e:
            return {'ok':False, 'message':str(e), 'data':[]}
    
    def select_as_dict(self, data:dict) -> dict:

        id = data['id']
        try:
            building = list(BuildingModel.objects.filter(id=id))[0]
            # the model_to_dict function is used in class
            data = model_to_dict(building)
            return {'ok':True, 'message':'Data retrieved', 'data':data}
        except Exception as e:
            return {'ok':False, 'message':str(e), 'data':[]}
    
