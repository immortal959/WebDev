from django.contrib.gis.db import models


class Building(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    floors = models.IntegerField()
    height = models.FloatField()
    category = models.CharField(max_length=100)
    visitedAt = models.DateTimeField()
    geom = models.PolygonField(srid=25830)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "web_building"
        managed = False


class Street(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    length = models.FloatField()
    lanes = models.IntegerField()
    category = models.CharField(max_length=100)
    visitedAt = models.DateTimeField()
    geom = models.LineStringField(srid=25830)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "web_street"
        managed = False


class Point(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    visitedAt = models.DateTimeField()
    rating = models.IntegerField()
    geom = models.PointField(srid=25830)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "web_points"
        managed = False