from django.db import connection

from erasmus_valencia.models import Point as PointModel
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry
from djangoapi.settings import EPSG_FOR_GEOMETRIES, ST_SNAP_PRECISION


class Point:


    def _check_identical(self, geom:GEOSGeometry, exclude_id: int = None) -> bool:

        '''
        Checks if the geometry is identical to any other geometry in the point table.
        This has to be done after snap_to_grid!
        '''
        
        # get all the pois the django way without sql
        pois = PointModel.objects.all()

        # if we update a poi, it must be excluded from the list to avoid self comparison
        if exclude_id is not None:
            pois = pois.exclude(id=exclude_id)

        # check for each point wether the geometry is identical. This has to be done after snap_to_grid
        for point in pois:
            if point.geom.equals(geom):
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
            point_model = PointModel()
            point_model.name = data['name']
            point_model.description = data['description']
            point_model.category = data['category']
            point_model.visitedAt = data['visitedAt']

            # check if the geom is valid, if it is not valid return an error message
            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            # snap to grid to avoid precision issues that can cause the geometry to be invalid or to intersect with other geometries
            geom = self._snap_to_grid(geom)

            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }
            
            if self._check_identical(geom):
                return {
                    "ok": False,
                    "message": "The Point is identical to another geometry in the point table: The same point already exists!",
                    "data": []
                }

            point_model.geom = geom
        
            point_model.save()

            return {'ok':True, 'message':'Point inserted', 'data':[{'id':point_model.id}]}
        
        except Exception as e:

            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}
    
    def update(self, data:dict) -> dict:
        try:
            id= data['id']
            # get the poiModel instance with the id of the poi we want to update
            point=list(PointModel.objects.filter(id=id))[0]

            # update all the data
            point.name = data['name']
            point.description = data['description']
            point.category = data['category']
            point.visitedAt = data['visitedAt']


            # check if the geom is valid, if it is not valid return an error message
            geom = GEOSGeometry(data["geom"], srid=EPSG_FOR_GEOMETRIES)

            geom = self._snap_to_grid(geom)

            if not geom.valid:
                return {
                    "ok": False,
                    "message": "Invalid geometry",
                    "data": []
                }
            
            if self._check_identical(geom, exclude_id=id):
                return {
                    "ok": False,
                    "message": "The Point is identical to another geometry in the point table: The same point already exists!",
                    "data": []
                }

            point.geom = geom
        
            point.save()

            return {'ok':True, 'message':'Point updated', 'data':[{'id':point.id}]}
        
        except Exception as e:

            return {'ok':False, 'message':f"An error occurred: {str(e)}", 'data':[]}
        
    
    def delete(self, data:dict) -> dict:

        id = data['id']
        try:
            point = list(POIModel.objects.filter(id=id))[0]
            point.delete()
            return {'ok':True, 'message':'Point deleted', 'data':[{'rows_deleted':1}]}
        except Exception as e:
            return {'ok':False, 'message':str(e), 'data':[]}
        
    def select_as_dict(self, data:dict) -> dict:

        id = data['id']
        try:
            point = list(PointModel.objects.filter(id=id))[0]
            return {'ok':True, 'message':'Point found', 'data':[model_to_dict(point)]}
        except Exception as e:
            return {'ok':False, 'message':str(e), 'data':[]}

