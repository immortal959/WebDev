import json
from django.http import JsonResponse
from django.contrib.gis.geos import GEOSGeometry
from core.myLib.baseDjangoView import BaseDjangoView
from web_proj.models import Building, Street, Point
from codelist.models import BuildingCategory, StreetCategory, PointCategory


def read_json(request):
    return request.POST


def building_to_dict(row):
    return {
        "id": row.id,
        "name": row.name,
        "description": row.description,
        "floors": row.floors,
        "height": row.height,
        "category": row.category.id if row.category else None,
        "category_name": row.category.name if row.category else '',
        "visitedAt": row.visitedAt,
        "geom": row.geom.wkt
    }


def street_to_dict(row):
    return {
        "id": row.id,
        "name": row.name,
        "description": row.description,
        "length": row.length,
        "lanes": row.lanes,
        "category": row.category.id if row.category else None,
        "category_name": row.category.name if row.category else '',
        "visitedAt": row.visitedAt,
        "geom": row.geom.wkt
    }


def point_to_dict(row):
    return {
        "id": row.id,
        "name": row.name,
        "description": row.description,
        "category": row.category.id if row.category else None,
        "category_name": row.category.name if row.category else '',
        "visitedAt": row.visitedAt,
        "rating": row.rating,
        "geom": row.geom.wkt
    }


class BuildingView(BaseDjangoView):

    def insert(self, request):
        try:
            data = read_json(request)
            geom = GEOSGeometry(data["geom"], srid=25830)
            if not geom.valid:
                return JsonResponse({"ok": False, "message": "Invalid geometry", "data": []})
            existing = Building.objects.filter(geom__intersects=geom)
            if existing.exists():
                return JsonResponse({"ok": False, "message": "Building intersects with an existing building", "data": []})
            category = BuildingCategory.objects.get(id=data["category"]) if data.get("category") else None
            row = Building(
                name=data["name"],
                description=data["description"],
                floors=data["floors"],
                height=data["height"],
                category=category,
                visitedAt=data["visitedAt"],
                geom=geom
            )
            row.save()
            return JsonResponse({"ok": True, "message": "Building inserted", "data": [building_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectone(self, id):
        try:
            row = Building.objects.get(id=id)
            return JsonResponse({"ok": True, "message": "Building selected", "data": [building_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectall(self):
        rows = Building.objects.all()
        data = [building_to_dict(row) for row in rows]
        return JsonResponse({"ok": True, "message": "Buildings selected", "data": data})

    def update(self, request, id):
        try:
            data = read_json(request)
            row = Building.objects.get(id=id)
            geom = GEOSGeometry(data["geom"], srid=25830)
            category = BuildingCategory.objects.get(id=data["category"]) if data.get("category") else None
            row.name = data["name"]
            row.description = data["description"]
            row.floors = data["floors"]
            row.height = data["height"]
            row.category = category
            row.visitedAt = data["visitedAt"]
            row.geom = geom
            row.save()
            return JsonResponse({"ok": True, "message": "Building updated", "data": [building_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def delete(self, id):
        try:
            row = Building.objects.get(id=id)
            data = building_to_dict(row)
            row.delete()
            return JsonResponse({"ok": True, "message": "Building deleted", "data": [data]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})


class StreetView(BaseDjangoView):

    def insert(self, request):
        try:
            data = read_json(request)
            geom = GEOSGeometry(data["geom"], srid=25830)
            if not geom.valid:
                return JsonResponse({"ok": False, "message": "Invalid geometry", "data": []})
            existing = Street.objects.filter(geom__intersects=geom)
            if existing.exists():
                return JsonResponse({"ok": False, "message": "Street intersects with an existing street", "data": []})
            category = StreetCategory.objects.get(id=data["category"]) if data.get("category") else None
            row = Street(
                name=data["name"],
                description=data["description"],
                length=data["length"],
                lanes=data["lanes"],
                category=category,
                visitedAt=data["visitedAt"],
                geom=geom
            )
            row.save()
            return JsonResponse({"ok": True, "message": "Street inserted", "data": [street_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectone(self, id):
        try:
            row = Street.objects.get(id=id)
            return JsonResponse({"ok": True, "message": "Street selected", "data": [street_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectall(self):
        rows = Street.objects.all()
        data = [street_to_dict(row) for row in rows]
        return JsonResponse({"ok": True, "message": "Streets selected", "data": data})

    def update(self, request, id):
        try:
            data = read_json(request)
            row = Street.objects.get(id=id)
            geom = GEOSGeometry(data["geom"], srid=25830)
            category = StreetCategory.objects.get(id=data["category"]) if data.get("category") else None
            row.name = data["name"]
            row.description = data["description"]
            row.length = data["length"]
            row.lanes = data["lanes"]
            row.category = category
            row.visitedAt = data["visitedAt"]
            row.geom = geom
            row.save()
            return JsonResponse({"ok": True, "message": "Street updated", "data": [street_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def delete(self, id):
        try:
            row = Street.objects.get(id=id)
            data = street_to_dict(row)
            row.delete()
            return JsonResponse({"ok": True, "message": "Street deleted", "data": [data]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})


class PointView(BaseDjangoView):

    def insert(self, request):
        try:
            data = read_json(request)
            geom = GEOSGeometry(data["geom"], srid=25830)
            if not geom.valid:
                return JsonResponse({"ok": False, "message": "Invalid geometry", "data": []})
            inside = Building.objects.filter(geom__contains=geom)
            if not inside.exists():
                return JsonResponse({"ok": False, "message": "Point must be inside a building polygon", "data": []})
            category = PointCategory.objects.get(id=data["category"]) if data.get("category") else None
            row = Point(
                name=data["name"],
                description=data["description"],
                category=category,
                visitedAt=data["visitedAt"],
                rating=data["rating"],
                geom=geom
            )
            row.save()
            return JsonResponse({"ok": True, "message": "Point inserted", "data": [point_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectone(self, id):
        try:
            row = Point.objects.get(id=id)
            return JsonResponse({"ok": True, "message": "Point selected", "data": [point_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def selectall(self):
        rows = Point.objects.all()
        data = [point_to_dict(row) for row in rows]
        return JsonResponse({"ok": True, "message": "Points selected", "data": data})

    def update(self, request, id):
        try:
            data = read_json(request)
            row = Point.objects.get(id=id)
            geom = GEOSGeometry(data["geom"], srid=25830)
            category = PointCategory.objects.get(id=data["category"]) if data.get("category") else None
            row.name = data["name"]
            row.description = data["description"]
            row.category = category
            row.visitedAt = data["visitedAt"]
            row.rating = data["rating"]
            row.geom = geom
            row.save()
            return JsonResponse({"ok": True, "message": "Point updated", "data": [point_to_dict(row)]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})

    def delete(self, id):
        try:
            row = Point.objects.get(id=id)
            data = point_to_dict(row)
            row.delete()
            return JsonResponse({"ok": True, "message": "Point deleted", "data": [data]})
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []})