from django import get_version
from django.http import JsonResponse
from django.views.decorators.http import require_GET
PROJECT="AI Recovery Assistant"
DISCLAIMER="The listed movements are illustrative UI examples, not an exercise prescription. This project does not analyse camera footage, diagnose conditions, or replace guidance from a qualified healthcare professional."
ITEMS=[
  {
    "id": "shoulder-raise",
    "name": "Shoulder raise",
    "category": "Upper-body mobility",
    "note": "Example movement entry. Use only if it is part of a plan provided by a qualified professional."
  },
  {
    "id": "seated-knee-extension",
    "name": "Seated knee extension",
    "category": "Lower-body movement",
    "note": "Example movement entry. Use only if it is part of a plan provided by a qualified professional."
  },
  {
    "id": "ankle-mobility",
    "name": "Ankle mobility",
    "category": "Gentle ankle movement",
    "note": "Example movement entry. Use only if it is part of a plan provided by a qualified professional."
  }
]
@require_GET
def health(request):
    return JsonResponse({"status":"ok","project":PROJECT,"framework":"Django","django_version":get_version()})
@require_GET
def exercises(request):
    return JsonResponse({"project":PROJECT,"items":ITEMS,"source":"illustrative starter entries","disclaimer":DISCLAIMER})
