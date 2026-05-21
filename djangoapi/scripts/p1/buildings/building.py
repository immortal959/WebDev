from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE
from psycopg.rows import dict_row


class Building():

    def __init__(self):
        return
    
    def connect(self, as_dict:bool = True):
        self.connection=connect()
        if as_dict:
            self.cursor=self.connection.cursor(row_factory=dict_row)
        else:
            self.cursor=self.connection.cursor()

    def disconnect(self):
        self.cursor.close()
        self.connection.close()

    def insert(self, data:dict) -> dict:

        try:

            self.connect()

            sql = """
                INSERT INTO data.buildings
                    (name, description, area, height, category, visitedAt, geom)
                SELECT
                    %s, %s, %s, %s, %s, %s,
                    g
                FROM (
                    SELECT ST_SnapToGrid(
                            ST_GeomFromText(%s, %s),
                            0.0001
                        ) AS g
                ) sub
                WHERE
                    ST_IsValid(g)
                    AND NOT EXISTS (
                        SELECT 1
                        FROM data.buildings b
                        WHERE ST_Intersects(b.geom, g)
                    )
                RETURNING id;
            """

            # get the values out of data dictionary 
            values =[
                data["name"],
                data["description"],
                float(data["area"]),
                float(data["height"]),
                data["category"],
                data["visitedAt"],
                data["geom"],
                data["epsg"],
            ]

            # execute query
            self.cursor.execute(sql, values)

            row = self.cursor.fetchone()

            if row is None:
                return {
                    "ok": False,
                    "message": "Insert failed. The polygon is probably overlapping with another one or has invalid geometry",
                    "data": None
                }
            
            self.connection.commit()

            return {
                "ok": True,
                "message": "Building inserted successfully.",
                "data": [row]
            }


        except Exception as e:
            self.connection.rollback()
            return {
                "ok": False,
                "message": str(e),
                "data": None
            }

        finally:
            self.disconnect()

    def select_as_dict(self, data:dict) -> dict:
        
        try:
        
            self.connect()

            id = int(data["id"])

            sql="""
                SELECT 
                    name, description, area, height, category, visitedAt, st_astext(geom)
                FROM 
                    data.buildings 
                WHERE
                    id = %s
                """
            self.cursor.execute(sql, [id])
            rows = self.cursor.fetchone()

            if rows is None:
                return {
                    "ok": True,
                    "message": f"No building with id {id} found.",
                    "data": None
                }
            
            print("Helo")
            
            return {
                "ok": True,
                "message": f"Building with id {id} selected",
                "data": [rows]
            }
        
        except Exception as e:
            self.connection.rollback()
            return {
                "ok": False,
                "message": str(e),
                "data": None
            }
        
        finally:
            self.disconnect()

    def select_as_tuple(self, data:dict) -> dict:
        
        try:
        
            self.connect(as_dict = False)

            id = int(data["id"])

            sql="""
                SELECT 
                    name, description, area, height, category, visitedAt, st_astext(geom)
                FROM 
                    data.buildings 
                WHERE
                    id = %s
                """
            self.cursor.execute(sql, [id])
            rows = self.cursor.fetchone()

            if rows is None:
                return {
                    "ok": True,
                    "message": f"No building with id {id} found.",
                    "data": None
                }
            
            print("Helo")
            
            return {
                "ok": True,
                "message": f"Building with id {id} selected",
                "data": [rows]
            }
        
        except Exception as e:
            self.connection.rollback()
            return {
                "ok": False,
                "message": str(e),
                "data": None
            }
        
        finally:
            self.disconnect()

    
    def update(self, data:dict) -> dict:

        try:
            self.connect()

            sql = """
                UPDATE data.buildings
                SET
                    name = %s,
                    description = %s,
                    area = %s,
                    height = %s,
                    category = %s,
                    visitedAt = %s,
                    geom = g
                FROM (
                    SELECT ST_SnapToGrid(
                            ST_GeomFromText(%s, %s),
                            0.0001
                        ) AS g
                ) sub
                WHERE
                    id = %s
                    AND ST_IsValid(g)
                    AND NOT EXISTS (
                        SELECT 1
                        FROM data.buildings b
                        WHERE b.id <> %s
                        AND ST_Intersects(b.geom, g)
                    )
                RETURNING id;
            """

            values = [
                data["name"],
                data["description"],
                float(data["area"]),
                float(data["height"]),
                data["category"],
                data["visitedAt"],
                data["geom"],
                data["epsg"],
                data["id"],
                data["id"],
            ]

            self.cursor.execute(sql, values)
            row =  self.cursor.fetchone()
            self.connection.commit()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No building found at id {values[-1]}. No building was updated",
                    "data": None
                }
            
            return {
                "ok": True,
                "message": f"building at id {values[-1]} updated.",
                "data": [row]
            }
        
        except Exception as e:
            self.connection.rollback()
            return {
                "ok": False,
                "message": str(e),
                "data": None
            }
        
        finally:
            self.disconnect()
    
    def delete(self, data:dict) -> dict:
        
        try: 
            self.connect()

            id = int(data["id"])

            sql="""
                DELETE FROM
                    data.buildings  
                WHERE
                    id=%s
                RETURNING id;
                """
            # As there are 5 %s, you need a list with 5 values: 
            #   [description, area, the_geom_wkt, the_epsg_code, 
            #           the_id_to_select_the_row]
            self.cursor.execute(sql, [id])
            row = self.cursor.fetchone()
            
            if row is None:
                return {
                    "ok": True,
                    "message": f"No building found at id {id}. No buidlings were deleted",
                    "data": None
                }
            
             
            self.connection.commit()
            return {
                "ok": True,
                "message": f"Row(s) deleted.",
                "data": [row]
            }
       
        except Exception as e:
            self.connection.rollback()
            return {
                "ok": False,
                "message": str(e),
                "data": None
            }
        
        finally:
            self.disconnect()