from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # Update this to your actual latest curriculum migration before running.
        ('curriculum', '0005_category_topic_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='problem',
            name='parameter_types',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text=(
                    "List of parameter types matching parameter_names order, e.g. "
                    '["int[]", "int"]. Only required for typed languages (Java, C). '
                    "Supported types: int, long, double, boolean, string, "
                    "int[], long[], double[], string[]."
                ),
            ),
        ),
        migrations.AddField(
            model_name='problem',
            name='return_type',
            field=models.CharField(
                max_length=20,
                default='int',
                help_text="Return type of the function, same supported types as parameter_types.",
            ),
        ),
    ]
