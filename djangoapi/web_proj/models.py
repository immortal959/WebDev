from django.contrib.gis.db import models
from codelist.models import BuildingCategory, StreetCategory, PointCategory

class Building(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    floors = models.IntegerField()
    height = models.FloatField()
    category = models.ForeignKey(BuildingCategory, on_delete=models.SET_NULL, null=True, blank=True)
    visitedAt = models.DateTimeField()
    geom = models.PolygonField(srid=25830)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Street(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    length = models.FloatField()
    lanes = models.IntegerField(default=1)
    category = models.ForeignKey(StreetCategory, on_delete=models.SET_NULL, null=True, blank=True)
    visitedAt = models.DateTimeField()
    geom = models.LineStringField(srid=25830)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Point(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(PointCategory, on_delete=models.SET_NULL, null=True, blank=True)
    visitedAt = models.DateTimeField()
    rating = models.IntegerField(default=0)
    geom = models.PointField(srid=25830)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name