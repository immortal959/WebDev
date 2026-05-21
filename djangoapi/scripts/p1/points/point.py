from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE
from psycopg.rows import dict_row

class Point():
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

            sql="""
                INSERT INTO data.points
                    (name, description, category, rating, priority, visitedAt, geom)
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
                    AND EXISTS (
                        SELECT 1
                        FROM data.buildings b
                        WHERE ST_Within(g, b.geom)
                    )
                RETURNING id;
                """
            
            value_list = [
                data["name"],
                data["description"],
                data["category"],
                int(data["rating"]),
                int(data["priority"]),
                data["visitedAt"],
                data["geom"],
                data["epsg"],
            ]
            
            self.cursor.execute(sql, value_list)
            row=self.cursor.fetchone()

            if row is None:
                return {
                    "ok": False,
                    "message": "Insert failed. Try inserting the point into an existing polygon",
                    "data": None
                }

            self.connection.commit()
            return {
                "ok": True,
                "message": "Point inserted successfully.",
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

            id = data["id"]

            cons="""
                DELETE FROM
                    data.points
                WHERE
                    id=%s
                RETURNING id;
                """
            # As there are 5 %s, you need a list with 5 values: 
            #   [description, area, the_geom_wkt, the_epsg_code, 
            #           the_id_to_select_the_row]
            
            self.cursor.execute(cons, [id])
            row = self.cursor.fetchone()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No point found at id {id}. No point was deleted",
                    "data": None
                }
            
            self.connection.commit()

            return {
                "ok": True,
                "message": f"point at id {id} deleted.",
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

    def update(self, data:dict) -> dict:

        try:
            self.connect()

            sql = """
                UPDATE data.points
                SET
                    name = %s,
                    description = %s,
                    category = %s,
                    rating = %s,
                    priority = %s,
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
                    AND EXISTS (
                        SELECT 1
                        FROM data.buildings b
                        WHERE ST_Within(g, b.geom)
                    )
                RETURNING id;
            """

            values = [
                data["name"],
                data["description"],
                data["category"],
                int(data["rating"]),
                int(data["priority"]),
                data["visitedAt"],
                data["geom"],
                data["epsg"],
                data["id"],
            ]

            self.cursor.execute(sql, values)
            row =  self.cursor.fetchone()

            if row is None:
                return {
                    "ok": True,
                    "message": f"Point not updated. Its probably not within an existing polygon",
                    "data": None
                }
            
            self.connection.commit()

            return {
                "ok": True,
                "message": f"point at id {values[-1]} updated.",
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

            cons="""
                SELECT 
                    name, description, category, rating, priority, visitedAt, st_astext(geom)
                FROM 
                    data.points 
                WHERE
                    id = %s

                """
            self.cursor.execute(cons, [id])
            row = self.cursor.fetchone()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No point with id {id} found.",
                    "data": None
                }
            
            return {
                "ok": True,
                "message": f"point with id {id} selected",
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

    def select_as_tuple(self, data:dict) -> dict:
        
        try:
            self.connect(as_dict = False)

            id = int(data["id"])

            cons="""
                SELECT 
                    name, description, category, rating, priority, visitedAt, st_astext(geom)
                FROM 
                    data.points 
                WHERE
                    id = %s

                """
            self.cursor.execute(cons, [id])
            row = self.cursor.fetchone()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No point with id {id} found.",
                    "data": None
                }
            
            return {
                "ok": True,
                "message": f"point with id {id} selected",
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

