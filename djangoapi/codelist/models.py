from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'codelist_category'

class BuildingCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'codelist_building_category'

class StreetCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'codelist_street_category'

class PointCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'codelist_point_category'