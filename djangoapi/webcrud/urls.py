from django.urls import path
from . import views

urlpatterns = [
    path("building/<str:action>/", views.BuildingView.as_view(), name="building_action"),
    path("building/<str:action>/<int:id>/", views.BuildingView.as_view(), name="building_action_id"),

    path("street/<str:action>/", views.StreetView.as_view(), name="street_action"),
    path("street/<str:action>/<int:id>/", views.StreetView.as_view(), name="street_action_id"),

    path("point/<str:action>/", views.PointView.as_view(), name="point_action"),
    path("point/<str:action>/<int:id>/", views.PointView.as_view(), name="point_action_id"),
]