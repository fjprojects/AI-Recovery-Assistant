from django import get_version
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import ExerciseReference

PROJECT = "AI Recovery Assistant"
DISCLAIMER = (
    "These are illustrative movement-library entries, not exercise prescriptions. "
    "The application does not analyse camera footage, assess recovery or diagnose conditions. "
    "Follow guidance from a qualified healthcare professional."
)


@require_GET
def health(request):
    return JsonResponse({
        "status": "ok",
        "project": PROJECT,
        "framework": "Django",
        "django_version": get_version(),
        "services": ["exercise-library"],
    })


@require_GET
def exercises(request):
    queryset = ExerciseReference.objects.all()
    category = request.GET.get("category", "").strip()
    query = request.GET.get("q", "").strip()

    if category and category.lower() != "all":
        queryset = queryset.filter(category__iexact=category)
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query)
            | Q(category__icontains=query)
            | Q(description__icontains=query)
        )

    items = [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "description": item.description,
            "professional_note": item.professional_note,
        }
        for item in queryset
    ]
    return JsonResponse({
        "project": PROJECT,
        "count": len(items),
        "items": items,
        "source": "illustrative reference catalogue",
        "disclaimer": DISCLAIMER,
    })
