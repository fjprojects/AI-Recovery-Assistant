from django.db import models


class ExerciseReference(models.Model):
    """A non-prescriptive movement information entry."""

    id = models.SlugField(primary_key=True, max_length=80)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=80, db_index=True)
    description = models.TextField()
    professional_note = models.TextField()
    sort_order = models.PositiveSmallIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("sort_order", "name")

    def __str__(self):
        return self.name
