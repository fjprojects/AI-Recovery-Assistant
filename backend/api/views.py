from django import get_version
from django.conf import settings
from django.db import DatabaseError, connection
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import ExerciseReference
from .pagination import error_response, paginate_items, text_parameter

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


def _database_ready():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True
    except DatabaseError:
        return False


def _catalogue_items():
    if settings.DEMO_DATA_MODE:
        return [dict(item) for item in DEMO_REFERENCES]

    return [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "description": item.description,
            "professional_note": item.professional_note,
        }
        for item in ExerciseReference.objects.all()
    ]


@require_GET
def health(request):
    database = "not-required" if settings.DEMO_DATA_MODE else (
        "connected" if _database_ready() else "unavailable"
    )
    if database == "unavailable":
        return JsonResponse({
            "status": "degraded",
            "project": PROJECT,
            "database": database,
            "data_mode": "database",
        }, status=503)

    return JsonResponse({
        "status": "ok",
        "project": PROJECT,
        "framework": "Django",
        "django_version": get_version(),
        "database": database,
        "services": ["exercise-library", "exercise-categories", "exercise-details"],
        "data_mode": "static-demo" if settings.DEMO_DATA_MODE else "database",
    })


@require_GET
def exercise_categories(request):
    categories = sorted(
        {item["category"] for item in _catalogue_items()},
        key=str.casefold,
    )
    return JsonResponse({
        "project": PROJECT,
        "count": len(categories),
        "categories": categories,
        "source": "illustrative reference catalogue",
        "disclaimer": DISCLAIMER,
    })


@require_GET
def exercise_detail(request, exercise_id):
    item = next(
        (record for record in _catalogue_items() if record["id"] == exercise_id),
        None,
    )
    if item is None:
        return error_response(
            "No movement reference exists with the requested identifier.",
            parameter="exercise_id",
            code="not_found",
            status=404,
        )

    return JsonResponse({
        "project": PROJECT,
        "item": item,
        "source": "illustrative reference catalogue",
        "disclaimer": DISCLAIMER,
    })


@require_GET
def exercises(request):
    category, error = text_parameter(request, "category", max_length=80)
    if error:
        return error
    query, error = text_parameter(request, "q", max_length=100)
    if error:
        return error
    sort, error = text_parameter(request, "sort", max_length=20)
    if error:
        return error
    order, error = text_parameter(request, "order", max_length=10)
    if error:
        return error

    sort = sort or "default"
    order = order or "asc"
    if sort not in {"default", "name", "category"}:
        return error_response(
            "Use one of: default, name, category.", parameter="sort"
        )
    if order not in {"asc", "desc"}:
        return error_response("Use 'asc' or 'desc'.", parameter="order")

    if settings.DEMO_DATA_MODE:
        records = _catalogue_items()
        if category and category.casefold() != "all":
            records = [
                item for item in records
                if item["category"].casefold() == category.casefold()
            ]
        if query:
            term = query.casefold()
            searchable_fields = ("name", "category", "description", "professional_note")
            records = [
                item for item in records
                if any(term in item[field].casefold() for field in searchable_fields)
            ]
        if sort != "default":
            records.sort(
                key=lambda item: item[sort].casefold(),
                reverse=(order == "desc"),
            )
    else:
        queryset = ExerciseReference.objects.all()
        if category and category.casefold() != "all":
            queryset = queryset.filter(category__iexact=category)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(category__icontains=query)
                | Q(description__icontains=query)
                | Q(professional_note__icontains=query)
            )
        if sort != "default":
            sort_field = sort
            if order == "desc":
                sort_field = f"-{sort_field}"
            queryset = queryset.order_by(sort_field, "name")
        records = [
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "description": item.description,
                "professional_note": item.professional_note,
            }
            for item in queryset
        ]

    page_items, pagination, error = paginate_items(request, records)
    if error:
        return error

    return JsonResponse({
        "project": PROJECT,
        "count": len(records),
        "items": page_items,
        "pagination": pagination,
        "filters": {"category": category or None, "q": query or None},
        "sort": {"by": sort, "order": order},
        "source": "illustrative reference catalogue",
        "disclaimer": DISCLAIMER,
    })
