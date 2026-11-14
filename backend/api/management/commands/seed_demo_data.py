from django.core.management.base import BaseCommand
from api.models import ExerciseReference


REFERENCES = [
    {
        "id": "shoulder-raise",
        "name": "Shoulder raise",
        "category": "Upper-body mobility",
        "description": "An illustrative upper-body movement reference. This entry is included to demonstrate how a structured movement library can be presented in the application.",
        "professional_note": "Only consider this movement when it has been selected for you by a qualified healthcare professional. Follow their instructions and stop to seek guidance if you have concerns.",
        "sort_order": 1,
    },
    {
        "id": "seated-knee-extension",
        "name": "Seated knee extension",
        "category": "Lower-body movement",
        "description": "An illustrative lower-body movement reference. The entry contains general catalogue information only and does not define repetitions, intensity or a personal programme.",
        "professional_note": "Use only as part of a plan supplied by a qualified healthcare professional. The application does not assess suitability for an individual.",
        "sort_order": 2,
    },
    {
        "id": "ankle-mobility",
        "name": "Ankle mobility",
        "category": "Gentle ankle movement",
        "description": "An example catalogue entry showing how movement information can be organised by category and reviewed in a digital interface.",
        "professional_note": "A qualified healthcare professional should determine whether this movement is appropriate and provide any instructions.",
        "sort_order": 3,
    },
]


class Command(BaseCommand):
    help = "Load fictional movement-library entries for the Reform prototype."

    def handle(self, *args, **options):
        for item in REFERENCES:
            ExerciseReference.objects.update_or_create(id=item["id"], defaults=item)
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(REFERENCES)} reference entries."))
