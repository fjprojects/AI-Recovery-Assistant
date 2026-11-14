from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("exercises/", views.exercises, name="exercises"),
    path("exercises/categories/", views.exercise_categories, name="exercise-categories"),
    path("exercises/<slug:exercise_id>/", views.exercise_detail, name="exercise-detail"),
]
