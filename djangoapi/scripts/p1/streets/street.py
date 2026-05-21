from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE
from psycopg.rows import dict_row

class Street():

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
                    INSERT INTO data.streets
                        (name, description, length, lanes, category, visitedAt, geom)
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
                            FROM data.streets s
                            WHERE ST_Intersects(s.geom, g)
                        )
                    RETURNING id;
                    """

                values = [
                    data["name"],
                    data["description"],
                    float(data["length"]),
                    int(data["lanes"]),
                    data["category"],
                    data["visitedAt"],
                    data["geom"],
                    int(data["epsg"])
                ]

                self.cursor.execute(sql, values)
                row = self.cursor.fetchone()

                self.connection.commit()


                if row is None:
                    return {
                        "ok": False,
                        "message": "Insert failed. The line probably intersects another one or has invalid geometry",
                        "data": None
                    }

                return {
                    "ok": True,
                    "message": "Street Inserted.",
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

            cons="""
                DELETE FROM
                    data.streets  
                WHERE
                    id=%s
                RETURNING id;
                """

            values= [int(data["id"])]
            self.cursor.execute(cons, values)
            self.connection.commit()

            row = self.cursor.fetchone()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No streets found at id {values[-1]}. No streets were deleted",
                    "data": None
                }
            
            return {
                "ok": True,
                "message": f"Street at id {values[-1]} deleted.",
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
                UPDATE data.streets
                SET
                    name = %s,
                    description = %s,
                    length = %s,
                    lanes = %s,
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
                        FROM data.streets s
                        WHERE s.id <> %s
                        AND ST_Intersects(s.geom, g)
                    )
                RETURNING id;
            """

            values = [
                data["name"],
                data["description"],
                float(data["length"]),
                int(data["lanes"]),
                data["category"],
                data["visitedAt"],
                data["geom"],
                int(data["epsg"]),
                int(data["id"]),
                int(data["id"])
            ]

            self.cursor.execute(sql, values)
            row = self.cursor.fetchone()
            self.connection.commit()

            if row is None:
                return {
                    "ok": True,
                    "message": f"No street found at id {values[-1]}. No street was updated.",
                    "data": None
                }

            return {
                "ok": True,
                "message": f"Data updated",
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

            sql = """
                SELECT 
                    name, description, length, lanes, category, visitedAt, ST_AsText(geom)
                FROM 
                    data.streets 
                WHERE
                    id = %s;
            """

            id = int(data["id"])

            self.cursor.execute(sql, [id])
            rows = self.cursor.fetchone()

            if not rows:
                return {
                    "ok": True,
                    "message": f"No street found at id {id}",
                    "data": None
                }

            return {
                "ok": True,
                "message": f"Street at id {id} retrieved successfully!",
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

            sql = """
                SELECT 
                    name, description, length, lanes, category, visitedAt, ST_AsText(geom)
                FROM 
                    data.streets 
                WHERE
                    id = %s;
            """

            id = int(data["id"])

            self.cursor.execute(sql, [id])
            row = self.cursor.fetchone()

            if not row:
                return {
                    "ok": True,
                    "message": f"No street found at id {id}",
                    "data": None
                }

            return {
                "ok": True,
                "message": f"Street at id {id} retrieved successfully!",
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
    
