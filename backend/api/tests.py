from django.test import TestCase, override_settings

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

    def test_health_endpoint_reports_database_mode(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["database"], "connected")
        self.assertIn("exercise-details", response.json()["services"])

    def test_exercise_detail_returns_one_reference(self):
        response = self.client.get("/api/exercises/shoulder-raise/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item"]["id"], "shoulder-raise")
        self.assertIn("professional_note", response.json()["item"])
        self.assertIn("not exercise prescriptions", response.json()["disclaimer"])

    def test_exercise_detail_returns_structured_404(self):
        response = self.client.get("/api/exercises/not-a-real-entry/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"]["code"], "not_found")

    def test_exercise_catalogue(self):
        response = self.client.get("/api/exercises/")
        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["count"], 2)
        self.assertEqual(payload["pagination"]["total_items"], 2)
        self.assertIn("professional_note", payload["items"][0])

    def test_category_filter_is_case_insensitive(self):
        response = self.client.get("/api/exercises/?category=gentle%20ankle%20movement")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()["items"]], ["ankle-mobility"])

    def test_search_matches_professional_note(self):
        response = self.client.get("/api/exercises/?q=qualified")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {item["id"] for item in response.json()["items"]},
            {"shoulder-raise", "ankle-mobility"},
        )

    def test_category_endpoint_returns_unique_sorted_values(self):
        response = self.client.get("/api/exercises/categories/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 2)
        self.assertEqual(
            response.json()["categories"],
            ["Gentle ankle movement", "Upper-body mobility"],
        )

    def test_sort_and_pagination(self):
        response = self.client.get("/api/exercises/?sort=name&order=desc&page_size=1")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 2)
        self.assertEqual(payload["items"][0]["id"], "shoulder-raise")
        self.assertTrue(payload["pagination"]["has_next"])

    def test_invalid_page_returns_structured_error(self):
        response = self.client.get("/api/exercises/?page=zero")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["parameter"], "page")

    def test_write_methods_are_not_allowed(self):
        response = self.client.post("/api/exercises/", data={})
        self.assertEqual(response.status_code, 405)


class ExerciseStaticDemoModeTests(TestCase):
    @override_settings(DEMO_DATA_MODE=True)
    def test_catalogue_is_available_without_database_seed(self):
        response = self.client.get("/api/exercises/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 3)
        self.assertEqual(response.json()["source"], "illustrative reference catalogue")
        self.assertEqual(response.json()["pagination"]["total_items"], 3)

    @override_settings(DEMO_DATA_MODE=True)
    def test_static_catalogue_supports_search_and_category_filters(self):
        by_category = self.client.get("/api/exercises/?category=gentle%20ankle%20movement")
        self.assertEqual([item["id"] for item in by_category.json()["items"]], ["ankle-mobility"])
        by_query = self.client.get("/api/exercises/?q=shoulder")
        self.assertEqual([item["id"] for item in by_query.json()["items"]], ["shoulder-raise"])

    @override_settings(DEMO_DATA_MODE=True)
    def test_categories_and_health_work_without_database(self):
        categories = self.client.get("/api/exercises/categories/")
        health = self.client.get("/api/health/")
        self.assertEqual(categories.status_code, 200)
        self.assertEqual(categories.json()["count"], 3)
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["database"], "not-required")

    @override_settings(DEMO_DATA_MODE=True)
    def test_detail_endpoint_uses_same_read_only_demo_catalogue(self):
        response = self.client.get("/api/exercises/ankle-mobility/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item"]["category"], "Gentle ankle movement")
