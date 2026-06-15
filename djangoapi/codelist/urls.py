from django.urls import path
from codelist import views

urlpatterns = [
    path("hello_world/", views.HelloWord.as_view(), name="hello_world"),
    path("building-category/", views.BuildingCategoryView.as_view(), name="building_category"),
    path("street-category/", views.StreetCategoryView.as_view(), name="street_category"),
    path("point-category/", views.PointCategoryView.as_view(), name="point_category"),
]