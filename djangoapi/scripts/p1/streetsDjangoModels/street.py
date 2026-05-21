from djangoapi.settings import EPSG_FOR_GEOMETRIES, ST_SNAP_PRECISION
from erasmus_valencia.models import Street as StreetModel
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry
from django.db import connection


class Street:

    def _intersects(self, geom:GEOSGeometry, exclude_id: int = None) -> list:
        '''
        Checks if the geometry intersects with any other geometry in the street table. 
        If it intersects return a list of the ids of the intersecting streets, if it does not intersect return an empty list
        '''

        # get all the street models the django way without sql
        streets = StreetModel.objects.all()
        
        # if we update a street, it must be excluded from the list to avoid self comparison
        if exclude_id is not None:
            streets = streets.exclude(id=exclude_id)
        intersecting_streets = []
        for street in streets:
            if street.geom.intersects(geom):
                intersecting_streets.append(street.id)
        return intersecting_streets
    
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
            street_model = StreetModel()
            street_model.name = data['name']
            street_model.category = data['category']
            street_model.description = data['description']
            street_model.length = data['length']
            street_model.lanes = data['lanes']

            street_model.visitedAt = data['visitedAt']

            # create the geom from wkt 
            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            # snap the geometry to a grid to avoid precision issues 
            geom = self._snap_to_grid(geom)

            intersection_list = self._intersects(geom)

            # check if the geometry intersects with any other geometry in the street table, if it does intersect ask the user if they want to insert it anyway
            # streets can actually intersect so its not an error, but we want to warn the user about it
            if len(intersection_list) > 0:
                insert = input(f"The geometry intersects with another street at id(s) {intersection_list} Do you want to insert it anyway? (y/n)") == "y"

                if not insert:
                    return {
                        "ok": False,
                        "message": "The geometry intersects with another street, aborted by user.",
                        "data": []
                    }

            # check if the geom is valid, if it is not valid return an error message
            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }

            street_model.geom = geom
        
            street_model.save()

            return {'ok':True, 'message':'Street inserted', 'data':[{'id':street_model.id}]}
        
        except Exception as e:

            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}
    
    def update(self, data:dict) -> dict:

        try:
            id= data['id']
            # get the streetModel instance with the id of the street we want to update
            street=list(StreetModel.objects.filter(id=id))[0]

            # update all the data
            street.name = data['name']
            street.category = data['category']
            street.description = data['description']
            street.length = data['length']
            street.lanes = data['lanes']

            street.visitedAt = data['visitedAt']

            # check if the geom is valid, if it is not valid return an error message
            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            geom = self._snap_to_grid(geom)

            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }

            street.geom = geom
        
            street.save()

            return {'ok':True, 'message':'Street updated', 'data':[{'id':street.id}]}
        
        except Exception as e:

            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}
    
    def delete(self, data:dict) -> dict:

        id = data['id']
        try:
            street = list(StreetModel.objects.filter(id=id))[0]
            street.delete()
            return {'ok':True, 'message':'Street deleted', 'data':[{'id':id}]}
        except Exception as e:
            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}
        
    def select_as_dict(self, data:dict) -> dict:

        id = data['id']
        try:
            street = list(StreetModel.objects.filter(id=id))[0]
            street_dict = model_to_dict(street)
            street_dict['geom'] = street.geom.geojson
            return {'ok':True, 'message':'Street found', 'data':[street_dict]}
        except Exception as e:
            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}