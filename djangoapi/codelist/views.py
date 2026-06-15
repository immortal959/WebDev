from django.http import JsonResponse
from django.views import View
from codelist.models import BuildingCategory, StreetCategory, PointCategory

class HelloWord(View):
    def get(self, request):
        return JsonResponse({"ok": True, "message": "Codelist. Hello world", "data": []})

class BuildingCategoryView(View):
    def get(self, request):
        categories = BuildingCategory.objects.all()
        data = [{"id": c.id, "name": c.name} for c in categories]
        return JsonResponse({"ok": True, "message": "Building categories", "data": data})

class StreetCategoryView(View):
    def get(self, request):
        categories = StreetCategory.objects.all()
        data = [{"id": c.id, "name": c.name} for c in categories]
        return JsonResponse({"ok": True, "message": "Street categories", "data": data})

class PointCategoryView(View):
    def get(self, request):
        categories = PointCategory.objects.all()
        data = [{"id": c.id, "name": c.name} for c in categories]
        return JsonResponse({"ok": True, "message": "Point categories", "data": data})