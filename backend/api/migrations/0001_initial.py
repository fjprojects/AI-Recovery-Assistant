from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="ExerciseReference",
            fields=[
                ("id", models.SlugField(max_length=80, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("category", models.CharField(db_index=True, max_length=80)),
                ("description", models.TextField()),
                ("professional_note", models.TextField()),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("sort_order", "name")},
        ),
    ]
