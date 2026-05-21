from django.contrib import admin

# Register your models here.
from .models import Building, Street, Point

admin.site.register(Building)
admin.site.register(Street)
admin.site.register(Point)
