from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("exercises/", views.exercises, name="exercises"),
    path("exercises/categories/", views.exercise_categories, name="exercise-categories"),
]
