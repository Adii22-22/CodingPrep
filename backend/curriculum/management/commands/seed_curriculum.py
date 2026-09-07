"""
Seeds the curriculum with 42 classic problems, correctly typed for Python/Java
from the start (parameter_types + return_type filled in for every problem, so
you don't need to hand-fix them in admin one by one like we did last night).

All types used are restricted to what harnesses.py actually supports:
int, long, double, boolean, string, int[]. (string[] and multi-dim arrays are
NOT supported yet - see README_SANDBOX_UPGRADE.md - so no problems here use them.)

Note: none of these problems work in C yet, since the C harness only supports
scalar params (int/long/double) passed as space-separated stdin - anything
using int[] or string params will fail in C until that's extended. They all
work fine in Python and Java.

Usage:
    python manage.py seed_curriculum
"""

from django.core.management.base import BaseCommand
from curriculum.models import Category, Topic, Problem
from engine.models import TestCase


PROBLEMS = [
    # ───────────────────────── Arrays ─────────────────────────
    {
        "topic": "Arrays", "title": "Two Sum", "difficulty": "easy",
        "function_name": "two_sum",
        "parameter_names": ["nums", "target"], "parameter_types": ["int[]", "int"],
        "return_type": "int[]",
        "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Assume exactly one solution exists.",
        "test_cases": [
            ({"nums": [2, 7, 11, 15], "target": 9}, [0, 1], True),
            ({"nums": [3, 2, 4], "target": 6}, [1, 2], True),
            ({"nums": [3, 3], "target": 6}, [0, 1], False),
        ],
    },
    {
        "topic": "Arrays", "title": "Contains Duplicate", "difficulty": "easy",
        "function_name": "contains_duplicate",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "boolean",
        "description": "Given an array of integers, return true if any value appears at least twice, and false if every element is distinct.",
        "test_cases": [
            ({"nums": [1, 2, 3, 1]}, True, True),
            ({"nums": [1, 2, 3, 4]}, False, True),
            ({"nums": [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]}, True, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Best Time to Buy and Sell Stock", "difficulty": "easy",
        "function_name": "max_profit",
        "parameter_names": ["prices"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given an array where prices[i] is the price of a stock on day i, return the maximum profit from buying on one day and selling on a later day. Return 0 if no profit is possible.",
        "test_cases": [
            ({"prices": [7, 1, 5, 3, 6, 4]}, 5, True),
            ({"prices": [7, 6, 4, 3, 1]}, 0, True),
            ({"prices": [1, 2]}, 1, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Maximum Subarray", "difficulty": "medium",
        "function_name": "max_subarray",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given an integer array, find the contiguous subarray with the largest sum and return that sum.",
        "test_cases": [
            ({"nums": [-2, 1, -3, 4, -1, 2, 1, -5, 4]}, 6, True),
            ({"nums": [1]}, 1, True),
            ({"nums": [5, 4, -1, 7, 8]}, 23, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Find Maximum Element", "difficulty": "easy",
        "function_name": "find_max",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Return the largest value in the given array of integers.",
        "test_cases": [
            ({"nums": [3, 1, 4, 1, 5, 9, 2, 6]}, 9, True),
            ({"nums": [-5, -2, -9]}, -2, True),
            ({"nums": [7]}, 7, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Find Minimum in Rotated Sorted Array", "difficulty": "medium",
        "function_name": "find_min_rotated",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "A sorted array has been rotated at an unknown pivot. Find and return the minimum element.",
        "test_cases": [
            ({"nums": [3, 4, 5, 1, 2]}, 1, True),
            ({"nums": [4, 5, 6, 7, 0, 1, 2]}, 0, True),
            ({"nums": [11, 13, 15, 17]}, 11, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Majority Element", "difficulty": "easy",
        "function_name": "majority_element",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given an array of size n, return the element that appears more than n/2 times. Assume it always exists.",
        "test_cases": [
            ({"nums": [3, 2, 3]}, 3, True),
            ({"nums": [2, 2, 1, 1, 1, 2, 2]}, 2, True),
            ({"nums": [1]}, 1, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Count Unique Elements in Sorted Array", "difficulty": "easy",
        "function_name": "count_unique",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given a sorted array, return the count of distinct values it contains.",
        "test_cases": [
            ({"nums": [1, 1, 2]}, 2, True),
            ({"nums": [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]}, 5, True),
            ({"nums": [1, 2, 3]}, 3, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Single Number", "difficulty": "easy",
        "function_name": "single_number",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given a non-empty array where every element appears twice except for one, find that single one.",
        "test_cases": [
            ({"nums": [2, 2, 1]}, 1, True),
            ({"nums": [4, 1, 2, 1, 2]}, 4, True),
            ({"nums": [1]}, 1, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Missing Number", "difficulty": "easy",
        "function_name": "missing_number",
        "parameter_names": ["nums", "n"], "parameter_types": ["int[]", "int"],
        "return_type": "int",
        "description": "Given an array containing n distinct numbers taken from 0 to n, return the one number missing from the range.",
        "test_cases": [
            ({"nums": [3, 0, 1], "n": 3}, 2, True),
            ({"nums": [0, 1], "n": 2}, 2, True),
            ({"nums": [9, 6, 4, 2, 3, 5, 7, 0, 1], "n": 9}, 8, False),
        ],
    },
    {
        "topic": "Arrays", "title": "Sum of Array", "difficulty": "easy",
        "function_name": "sum_array",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Return the sum of all elements in the given array.",
        "test_cases": [
            ({"nums": [1, 2, 3, 4, 5]}, 15, True),
            ({"nums": [-1, -2, 3]}, 0, True),
            ({"nums": [10]}, 10, False),
        ],
    },

    # ───────────────────────── Strings ─────────────────────────
    {
        "topic": "Strings", "title": "Valid Palindrome", "difficulty": "easy",
        "function_name": "is_palindrome",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "boolean",
        "description": "Return true if the given string reads the same forwards and backwards.",
        "test_cases": [
            ({"s": "racecar"}, True, True),
            ({"s": "hello"}, False, True),
            ({"s": "madam"}, True, False),
        ],
    },
    {
        "topic": "Strings", "title": "Valid Anagram", "difficulty": "easy",
        "function_name": "valid_anagram",
        "parameter_names": ["s", "t"], "parameter_types": ["string", "string"],
        "return_type": "boolean",
        "description": "Return true if t is an anagram of s (same letters, same counts, any order).",
        "test_cases": [
            ({"s": "anagram", "t": "nagaram"}, True, True),
            ({"s": "rat", "t": "car"}, False, True),
            ({"s": "listen", "t": "silent"}, True, False),
        ],
    },
    {
        "topic": "Strings", "title": "Reverse String", "difficulty": "easy",
        "function_name": "reverse_string_return",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "string",
        "description": "Return the given string reversed.",
        "test_cases": [
            ({"s": "hello"}, "olleh", True),
            ({"s": "world"}, "dlrow", True),
            ({"s": "a"}, "a", False),
        ],
    },
    {
        "topic": "Strings", "title": "First Unique Character", "difficulty": "easy",
        "function_name": "first_unique_char",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "int",
        "description": "Return the index of the first non-repeating character in the string, or -1 if none exists.",
        "test_cases": [
            ({"s": "leetcode"}, 0, True),
            ({"s": "loveleetcode"}, 2, True),
            ({"s": "aabb"}, -1, False),
        ],
    },
    {
        "topic": "Strings", "title": "Valid Parentheses", "difficulty": "easy",
        "function_name": "valid_parentheses",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "boolean",
        "description": "Given a string containing just the characters (){}[], determine if every bracket is properly opened and closed in the right order.",
        "test_cases": [
            ({"s": "()"}, True, True),
            ({"s": "()[]{}"}, True, True),
            ({"s": "(]"}, False, False),
        ],
    },
    {
        "topic": "Strings", "title": "Count Vowels", "difficulty": "easy",
        "function_name": "count_vowels",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "int",
        "description": "Return the number of vowels (a, e, i, o, u, case-insensitive) in the given string.",
        "test_cases": [
            ({"s": "hello world"}, 3, True),
            ({"s": "sky"}, 0, True),
            ({"s": "AEIOUaeiou"}, 10, False),
        ],
    },
    {
        "topic": "Strings", "title": "Is Isogram", "difficulty": "easy",
        "function_name": "is_isogram",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "boolean",
        "description": "An isogram is a word with no repeating letters (case-insensitive). Return true if the given string is an isogram.",
        "test_cases": [
            ({"s": "lumberjacks"}, True, True),
            ({"s": "hello"}, False, True),
            ({"s": "isogram"}, True, False),
        ],
    },
    {
        "topic": "Strings", "title": "Capitalize First Letter", "difficulty": "easy",
        "function_name": "capitalize_first_letter",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "string",
        "description": "Return the given string with its first letter capitalized.",
        "test_cases": [
            ({"s": "hello"}, "Hello", True),
            ({"s": "world"}, "World", True),
            ({"s": "a"}, "A", False),
        ],
    },
    {
        "topic": "Strings", "title": "Count Words", "difficulty": "easy",
        "function_name": "count_words",
        "parameter_names": ["s"], "parameter_types": ["string"],
        "return_type": "int",
        "description": "Return the number of space-separated words in the given string.",
        "test_cases": [
            ({"s": "the quick brown fox"}, 4, True),
            ({"s": "hello"}, 1, True),
            ({"s": "a b c d e"}, 5, False),
        ],
    },
    {
        "topic": "Strings", "title": "String Rotation", "difficulty": "medium",
        "function_name": "is_rotation",
        "parameter_names": ["s", "goal"], "parameter_types": ["string", "string"],
        "return_type": "boolean",
        "description": "Return true if goal can be formed by rotating string s by some number of positions.",
        "test_cases": [
            ({"s": "waterbottle", "goal": "erbottlewat"}, True, True),
            ({"s": "hello", "goal": "ohlle"}, False, True),
            ({"s": "abc", "goal": "cab"}, True, False),
        ],
    },

    # ───────────────────────── Two Pointers ─────────────────────────
    {
        "topic": "Two Pointers", "title": "Two Sum (Sorted Input)", "difficulty": "easy",
        "function_name": "two_sum_sorted",
        "parameter_names": ["nums", "target"], "parameter_types": ["int[]", "int"],
        "return_type": "int[]",
        "description": "Given a sorted array of integers and a target, return the indices of the two numbers that add up to target.",
        "test_cases": [
            ({"nums": [2, 7, 11, 15], "target": 9}, [0, 1], True),
            ({"nums": [2, 3, 4], "target": 6}, [0, 2], True),
            ({"nums": [-1, 0], "target": -1}, [0, 1], False),
        ],
    },
    {
        "topic": "Two Pointers", "title": "Palindrome Number", "difficulty": "easy",
        "function_name": "is_palindrome_number",
        "parameter_names": ["x"], "parameter_types": ["int"],
        "return_type": "boolean",
        "description": "Given an integer, return true if it reads the same forwards and backwards without converting it to a string.",
        "test_cases": [
            ({"x": 121}, True, True),
            ({"x": -121}, False, True),
            ({"x": 10}, False, False),
        ],
    },
    {
        "topic": "Two Pointers", "title": "Reverse Integer", "difficulty": "medium",
        "function_name": "reverse_integer",
        "parameter_names": ["x"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Given a 32-bit signed integer, return it with its digits reversed. The sign is preserved.",
        "test_cases": [
            ({"x": 123}, 321, True),
            ({"x": -123}, -321, True),
            ({"x": 120}, 21, False),
        ],
    },
    {
        "topic": "Two Pointers", "title": "Container With Most Water", "difficulty": "medium",
        "function_name": "max_area",
        "parameter_names": ["heights"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given an array of heights representing vertical lines, find two lines that together with the x-axis form a container holding the most water, and return that max area.",
        "test_cases": [
            ({"heights": [1, 8, 6, 2, 5, 4, 8, 3, 7]}, 49, True),
            ({"heights": [1, 1]}, 1, True),
            ({"heights": [4, 3, 2, 1, 4]}, 16, False),
        ],
    },
    {
        "topic": "Two Pointers", "title": "Remove Element", "difficulty": "easy",
        "function_name": "remove_element_count",
        "parameter_names": ["nums", "val"], "parameter_types": ["int[]", "int"],
        "return_type": "int",
        "description": "Given an array and a value, return the count of elements remaining after removing every occurrence of val.",
        "test_cases": [
            ({"nums": [3, 2, 2, 3], "val": 3}, 2, True),
            ({"nums": [0, 1, 2, 2, 3, 0, 4, 2], "val": 2}, 5, True),
            ({"nums": [1], "val": 1}, 0, False),
        ],
    },

    # ───────────────────────── Math ─────────────────────────
    {
        "topic": "Math", "title": "Fibonacci Number", "difficulty": "easy",
        "function_name": "fibonacci",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "long",
        "description": "Return the nth Fibonacci number (0-indexed, fib(0)=0, fib(1)=1).",
        "test_cases": [
            ({"n": 0}, 0, True),
            ({"n": 1}, 1, True),
            ({"n": 10}, 55, False),
        ],
    },
    {
        "topic": "Math", "title": "Factorial", "difficulty": "easy",
        "function_name": "factorial",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "long",
        "description": "Return n factorial (n!). Assume n >= 0.",
        "test_cases": [
            ({"n": 0}, 1, True),
            ({"n": 5}, 120, True),
            ({"n": 10}, 3628800, False),
        ],
    },
    {
        "topic": "Math", "title": "Is Prime", "difficulty": "easy",
        "function_name": "is_prime",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "boolean",
        "description": "Return true if n is a prime number.",
        "test_cases": [
            ({"n": 7}, True, True),
            ({"n": 10}, False, True),
            ({"n": 1}, False, False),
        ],
    },
    {
        "topic": "Math", "title": "Greatest Common Divisor", "difficulty": "easy",
        "function_name": "gcd",
        "parameter_names": ["a", "b"], "parameter_types": ["int", "int"],
        "return_type": "int",
        "description": "Return the greatest common divisor of two positive integers.",
        "test_cases": [
            ({"a": 48, "b": 18}, 6, True),
            ({"a": 7, "b": 13}, 1, True),
            ({"a": 100, "b": 75}, 25, False),
        ],
    },
    {
        "topic": "Math", "title": "Power of Two", "difficulty": "easy",
        "function_name": "is_power_of_two",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "boolean",
        "description": "Return true if n is a power of two.",
        "test_cases": [
            ({"n": 16}, True, True),
            ({"n": 18}, False, True),
            ({"n": 1}, True, False),
        ],
    },
    {
        "topic": "Math", "title": "Sum of Digits", "difficulty": "easy",
        "function_name": "sum_of_digits",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Return the sum of the digits of a non-negative integer n.",
        "test_cases": [
            ({"n": 12345}, 15, True),
            ({"n": 0}, 0, True),
            ({"n": 999}, 27, False),
        ],
    },
    {
        "topic": "Math", "title": "Armstrong Number", "difficulty": "medium",
        "function_name": "is_armstrong_number",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "boolean",
        "description": "An Armstrong number equals the sum of its own digits each raised to the power of the number of digits. Return true if n is an Armstrong number.",
        "test_cases": [
            ({"n": 153}, True, True),
            ({"n": 123}, False, True),
            ({"n": 9474}, True, False),
        ],
    },
    {
        "topic": "Math", "title": "Celsius to Fahrenheit", "difficulty": "easy",
        "function_name": "celsius_to_fahrenheit",
        "parameter_names": ["celsius"], "parameter_types": ["double"],
        "return_type": "double",
        "description": "Convert a temperature in Celsius to Fahrenheit.",
        "test_cases": [
            ({"celsius": 0.0}, 32.0, True),
            ({"celsius": 100.0}, 212.0, True),
            ({"celsius": 37.0}, 98.6, False),
        ],
    },
    {
        "topic": "Math", "title": "Count Primes Up To N", "difficulty": "medium",
        "function_name": "count_primes_upto",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Return the count of prime numbers strictly less than n.",
        "test_cases": [
            ({"n": 10}, 4, True),
            ({"n": 1}, 0, True),
            ({"n": 20}, 8, False),
        ],
    },
    {
        "topic": "Math", "title": "Reverse Digits", "difficulty": "easy",
        "function_name": "digit_reversal",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Return the integer n with its digits reversed (n is non-negative).",
        "test_cases": [
            ({"n": 1234}, 4321, True),
            ({"n": 100}, 1, True),
            ({"n": 0}, 0, False),
        ],
    },

    # ───────────────────────── Bit Manipulation ─────────────────────────
    {
        "topic": "Bit Manipulation", "title": "Count Set Bits", "difficulty": "easy",
        "function_name": "count_set_bits",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Return the number of 1 bits in the binary representation of n.",
        "test_cases": [
            ({"n": 11}, 3, True),
            ({"n": 0}, 0, True),
            ({"n": 255}, 8, False),
        ],
    },
    {
        "topic": "Bit Manipulation", "title": "Power of Four", "difficulty": "easy",
        "function_name": "is_power_of_four",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "boolean",
        "description": "Return true if n is a power of four.",
        "test_cases": [
            ({"n": 16}, True, True),
            ({"n": 5}, False, True),
            ({"n": 1}, True, False),
        ],
    },
    {
        "topic": "Bit Manipulation", "title": "Number Complement", "difficulty": "easy",
        "function_name": "find_complement",
        "parameter_names": ["n"], "parameter_types": ["int"],
        "return_type": "int",
        "description": "Return the complement of n's bits, considering only the bits needed to represent n (no leading zero padding).",
        "test_cases": [
            ({"n": 5}, 2, True),
            ({"n": 1}, 0, True),
            ({"n": 8}, 7, False),
        ],
    },
    {
        "topic": "Bit Manipulation", "title": "Hamming Distance", "difficulty": "easy",
        "function_name": "hamming_distance",
        "parameter_names": ["x", "y"], "parameter_types": ["int", "int"],
        "return_type": "int",
        "description": "Return the number of positions at which the binary representations of x and y differ.",
        "test_cases": [
            ({"x": 1, "y": 4}, 2, True),
            ({"x": 3, "y": 1}, 1, True),
            ({"x": 0, "y": 0}, 0, False),
        ],
    },

    # ───────────────────────── Hashing & Sets ─────────────────────────
    {
        "topic": "Hashing & Sets", "title": "Intersection of Two Arrays", "difficulty": "easy",
        "function_name": "intersection_count",
        "parameter_names": ["nums1", "nums2"], "parameter_types": ["int[]", "int[]"],
        "return_type": "int",
        "description": "Given two arrays, return the count of distinct values that appear in both.",
        "test_cases": [
            ({"nums1": [1, 2, 2, 1], "nums2": [2, 2]}, 1, True),
            ({"nums1": [4, 9, 5], "nums2": [9, 4, 9, 8, 4]}, 2, True),
            ({"nums1": [1, 2, 3], "nums2": [4, 5, 6]}, 0, False),
        ],
    },
    {
        "topic": "Hashing & Sets", "title": "Find the Duplicate Number", "difficulty": "medium",
        "function_name": "find_duplicate",
        "parameter_names": ["nums"], "parameter_types": ["int[]"],
        "return_type": "int",
        "description": "Given an array of n+1 integers where each value is between 1 and n, exactly one value repeats. Return that repeated value.",
        "test_cases": [
            ({"nums": [1, 3, 4, 2, 2]}, 2, True),
            ({"nums": [3, 1, 3, 4, 2]}, 3, True),
            ({"nums": [1, 1]}, 1, False),
        ],
    },
]


class Command(BaseCommand):
    help = "Seeds the curriculum with 42 correctly-typed problems across 6 topics."

    def handle(self, *args, **options):
        category, _ = Category.objects.get_or_create(
            title="DSA Fundamentals",
            defaults={"description": "Core data structure and algorithm practice problems.", "order": 1},
        )

        topic_cache = {}
        created_count = 0

        for entry in PROBLEMS:
            topic_title = entry["topic"]
            if topic_title not in topic_cache:
                topic_obj, _ = Topic.objects.get_or_create(
                    title=topic_title, category=category
                )
                topic_cache[topic_title] = topic_obj
            topic_obj = topic_cache[topic_title]

            problem, created = Problem.objects.update_or_create(
                title=entry["title"],
                defaults={
                    "topic": topic_obj,
                    "description": entry["description"],
                    "difficulty": entry["difficulty"],
                    "function_name": entry["function_name"],
                    "parameter_names": entry["parameter_names"],
                    "parameter_types": entry["parameter_types"],
                    "return_type": entry["return_type"],
                },
            )

            # Clear old test cases for this problem before re-adding (safe for re-runs)
            TestCase.objects.filter(problem=problem).delete()

            for order, (input_data, expected_output, is_sample) in enumerate(entry["test_cases"], start=1):
                TestCase.objects.create(
                    problem=problem,
                    input_data=input_data,
                    expected_output=expected_output,
                    is_sample=is_sample,
                    order=order,
                )

            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(PROBLEMS)} problems across {len(topic_cache)} topics "
            f"({created_count} newly created)."
        ))
