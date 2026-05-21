from django.test import TestCase
from .models import Building

# Create your tests here.
building = Building.objects.create(name="Test Building", description="A building for testing", floors=5, height=20.5, category="Test Category", visitedAt="2024-01-01T12:00:00Z", geom='POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))')
