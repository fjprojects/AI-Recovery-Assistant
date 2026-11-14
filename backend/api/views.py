from django import get_version
from django.conf import settings
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

DEMO_REFERENCES = [
    {
        "id": "shoulder-raise",
        "name": "Shoulder raise",
        "category": "Upper-body mobility",
        "description": "An illustrative upper-body movement reference for demonstrating a structured digital library.",
        "professional_note": "Only consider movements selected for you by a qualified healthcare professional. The application does not assess suitability.",
    },
    {
        "id": "seated-knee-extension",
        "name": "Seated knee extension",
        "category": "Lower-body movement",
        "description": "An illustrative lower-body movement reference. This entry does not define repetitions, intensity or a personal programme.",
        "professional_note": "Use only as part of a plan supplied by a qualified healthcare professional.",
    },
    {
        "id": "ankle-mobility",
        "name": "Ankle mobility",
        "category": "Gentle ankle movement",
        "description": "An example catalogue entry showing how movement information can be organised by category.",
        "professional_note": "A qualified healthcare professional should determine whether this movement is appropriate and provide any instructions.",
    },
]


@require_GET
def health(request):
    return JsonResponse({
        "status": "ok",
        "project": PROJECT,
        "framework": "Django",
        "django_version": get_version(),
        "services": ["exercise-library"],
        "data_mode": "static-demo" if settings.DEMO_DATA_MODE else "database",
    })


@require_GET
def exercises(request):
    category = request.GET.get("category", "").strip()
    query = request.GET.get("q", "").strip()

    if settings.DEMO_DATA_MODE:
        items = DEMO_REFERENCES
        if category and category.lower() != "all":
            items = [item for item in items if item["category"].casefold() == category.casefold()]
        if query:
            term = query.casefold()
            items = [
                item for item in items
                if term in " ".join([
                    item["name"], item["category"], item["description"]
                ]).casefold()
            ]
        items = [dict(item) for item in items]
    else:
        queryset = ExerciseReference.objects.all()
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
