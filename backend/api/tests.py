from django.test import TestCase
from api.models import ExerciseReference


class ExerciseApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        ExerciseReference.objects.create(
            id="shoulder-raise",
            name="Shoulder raise",
            category="Upper-body mobility",
            description="Illustrative catalogue description.",
            professional_note="Follow qualified professional guidance.",
            sort_order=1,
        )
        ExerciseReference.objects.create(
            id="ankle-mobility",
            name="Ankle mobility",
            category="Gentle ankle movement",
            description="Another sample catalogue description.",
            professional_note="Ask a qualified professional.",
            sort_order=2,
        )

    def test_health_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_exercise_catalogue(self):
        response = self.client.get("/api/exercises/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 2)
        self.assertIn("professional_note", response.json()["items"][0])

    def test_category_filter(self):
        response = self.client.get("/api/exercises/?category=Gentle%20ankle%20movement")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()["items"]], ["ankle-mobility"])

    def test_search_filter(self):
        response = self.client.get("/api/exercises/?q=shoulder")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()["items"]], ["shoulder-raise"])


    def test_health_identifies_this_project_service(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["project"], "AI Recovery Assistant")
        self.assertEqual(response.json()["services"], ["exercise-library"])

    def test_write_methods_are_not_allowed(self):
        response = self.client.post("/api/exercises/", data={})
        self.assertEqual(response.status_code, 405)
