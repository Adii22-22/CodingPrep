import os
import django
import sys

# Setup django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from curriculum.models import Category, Topic, Lesson, Problem
from engine.models import TestCase, Submission
from seed_data import topics_data, problems_data

def run_seed():
    print("Deleting all existing data...")
    # This will cascade and delete Lessons, Problems, TestCases, and Submissions
    Category.objects.all().delete()
    Topic.objects.all().delete()
    
    # Just to be absolutely sure because Submissions might not cascade from Topic if they are attached to users in a weird way
    Submission.objects.all().delete() 
    TestCase.objects.all().delete()
    Problem.objects.all().delete()
    Lesson.objects.all().delete()

    print("Data wiped clean.")
    print("-" * 30)

    # Dictionary to quickly find the Topic instance by its title
    topic_instances = {}

    print("Seeding Categories, Topics and Lessons...")
    
    cat_ds = Category.objects.create(title="Data Structures", description="Develop a practical understanding of the structures used to organize and access data efficiently.", order=1)
    cat_sd = Category.objects.create(title="System Design", description="Learn how to design scalable and robust systems.", order=2)
    cat_algo = Category.objects.create(title="Algorithms", description="Master problem-solving algorithms.", order=3)

    for t_data in topics_data:
        topic = Topic.objects.create(category=cat_ds, title=t_data["title"])
        topic_instances[t_data["title"]] = topic
        
        # Create a lesson for this topic
        Lesson.objects.create(
            topic=topic,
            title=t_data["lesson_title"],
            content=t_data["lesson_content"]
        )
        print(f"  Created Topic: {topic.title}")

    print("-" * 30)
    print(f"Seeding {len(problems_data)} Problems and their Test Cases...")
    
    problem_count = 0
    test_case_count = 0

    for p_data in problems_data:
        topic_title = p_data["topic"]
        if topic_title not in topic_instances:
            print(f"  Warning: Topic '{topic_title}' not found. Skipping problem '{p_data['title']}'.")
            continue
            
        topic = topic_instances[topic_title]
        
        problem = Problem.objects.create(
            topic=topic,
            title=p_data["title"],
            description=p_data["description"],
            difficulty=p_data["difficulty"],
            function_name=p_data["function_name"],
            parameter_names=p_data["parameter_names"]
        )
        problem_count += 1
        
        for index, tc in enumerate(p_data["test_cases"]):
            TestCase.objects.create(
                problem=problem,
                input_data=tc["input"],
                expected_output=tc["output"],
                is_sample=True, # Display them to the user by default
                order=index + 1
            )
            test_case_count += 1

    print("-" * 30)
    print("Database seeding completed successfully!")
    print(f"Total Topics Created: {len(topic_instances)}")
    print(f"Total Problems Created: {problem_count}")
    print(f"Total Test Cases Created: {test_case_count}")

if __name__ == "__main__":
    run_seed()
