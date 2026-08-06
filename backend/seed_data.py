topics_data = [
    {
        "title": "Arrays & Hashing",
        "lesson_title": "Introduction to Arrays and Hash Maps",
        "lesson_content": "## Arrays and Hashing\n\nArrays are foundational data structures that store elements in contiguous memory. They offer O(1) time complexity for accessing elements by index, but inserting or deleting elements in the middle can take O(n) time.\n\nHash Maps (or Dictionaries in Python) store key-value pairs. They provide O(1) average time complexity for insertions, deletions, and lookups. This makes them incredibly powerful for counting frequencies, caching, and solving problems where you need to check for the existence of an element quickly.\n\n### Key Patterns:\n- **Prefix Sums:** Useful for range sum queries.\n- **Hash Map for Counting:** Store the frequency of elements.\n- **Hash Map for Existence:** Quickly check if an element was seen before (e.g., Two Sum)."
    },
    {
        "title": "Two Pointers",
        "lesson_title": "The Two Pointer Technique",
        "lesson_content": "## Two Pointers\n\nThe two-pointer technique involves using two indices (or pointers) to traverse a data structure, typically an array or a string. This is commonly used to search for pairs in a sorted array or to reverse an array in-place.\n\n### Common Variations:\n- **Opposite Ends:** One pointer starts at the beginning (left) and the other at the end (right). They move towards each other until they meet. This is useful for problems like finding pairs that sum to a target in a sorted array.\n- **Same Direction (Fast and Slow):** Both pointers start at the beginning, but move at different speeds. Useful for cycle detection (Floyd's algorithm) or removing duplicates."
    },
    {
        "title": "Sliding Window",
        "lesson_title": "Sliding Window Optimization",
        "lesson_content": "## Sliding Window\n\nThe sliding window technique is an extension of the two-pointer approach, specifically used for finding subarrays or substrings that satisfy a certain condition (e.g., maximum sum, longest substring without repeating characters).\n\n### How it works:\n1. Maintain a 'window' defined by a `left` and `right` pointer.\n2. Expand the window by moving the `right` pointer and updating the window's state (e.g., adding to a sum, adding to a character frequency map).\n3. If the window violates the problem's condition, shrink it by moving the `left` pointer until the condition is satisfied again.\n\nThis technique often reduces O(n^2) time complexity down to O(n)."
    },
    {
        "title": "Stack",
        "lesson_title": "Understanding Stacks",
        "lesson_content": "## Stacks\n\nA stack is a LIFO (Last-In, First-Out) data structure. You can think of it like a stack of plates: you add plates to the top and remove them from the top.\n\n### Operations:\n- **Push:** Add an element to the top (O(1)).\n- **Pop:** Remove the top element (O(1)).\n- **Peek:** View the top element without removing it (O(1)).\n\n### Common Use Cases:\n- Parsing expressions (e.g., matching parentheses).\n- Tracking the history of operations (e.g., undo features).\n- **Monotonic Stack:** A specialized pattern where elements in the stack are strictly increasing or decreasing. Useful for finding the 'next greater element'."
    },
    {
        "title": "Binary Search",
        "lesson_title": "Efficient Searching with Binary Search",
        "lesson_content": "## Binary Search\n\nBinary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.\n\n### Key Concepts:\n- **Time Complexity:** O(log n).\n- **Requirements:** The search space MUST be sorted or monotonic (a property that is false up to a point, and then true forever, or vice versa).\n\n### The Standard Template:\n```python\nleft, right = 0, len(arr) - 1\nwhile left <= right:\n    mid = left + (right - left) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1\nreturn -1\n```"
    },
    {
        "title": "Linked List",
        "lesson_title": "Mastering Linked Lists",
        "lesson_content": "## Linked Lists\n\nA linked list is a linear data structure where elements (nodes) are not stored in contiguous memory locations. Instead, each node contains data and a pointer (or reference) to the next node in the sequence.\n\n### Types:\n- **Singly Linked List:** Nodes point only to the next node.\n- **Doubly Linked List:** Nodes point to both the previous and next nodes.\n\n### Common Techniques:\n- **Dummy Node:** Creating a dummy head node simplifies edge cases (like deleting the actual head).\n- **Multiple Pointers:** Just like with arrays, using fast/slow pointers is very common for finding the middle or detecting cycles."
    },
    {
        "title": "Trees",
        "lesson_title": "Traversing Trees",
        "lesson_content": "## Trees\n\nA tree is a hierarchical data structure consisting of nodes connected by edges. The top node is the root, and nodes with no children are leaves. A Binary Tree restricts nodes to having at most two children (left and right).\n\n### Traversal Methods:\n- **Depth-First Search (DFS):** Explores as far down a branch as possible before backtracking. Implemented using recursion or a stack. Includes Pre-order, In-order, and Post-order.\n- **Breadth-First Search (BFS):** Explores the tree level by level. Implemented using a queue.\n\n### Binary Search Tree (BST):\nA specialized binary tree where the left child's value is less than the parent's, and the right child's value is greater. In-order traversal of a BST yields a sorted array."
    },
    {
        "title": "Dynamic Programming",
        "lesson_title": "Introduction to DP",
        "lesson_content": "## Dynamic Programming\n\nDynamic Programming (DP) is an optimization technique used to solve complex problems by breaking them down into simpler subproblems, and storing the results of these subproblems to avoid redundant computations (memoization or tabulation).\n\n### Two Approaches:\n1. **Top-Down (Memoization):** Start with the main problem and recursively solve subproblems, storing their results in a cache (like a hash map).\n2. **Bottom-Up (Tabulation):** Start with the smallest subproblems and build up to the main problem, usually using an array or table to store intermediate states.\n\n### Key Steps:\n1. Identify the state variables (what changes between subproblems?).\n2. Define the recurrence relation (how does the current state depend on previous states?).\n3. Determine the base cases."
    }
]

problems_data = [
    # Arrays & Hashing
    {
        "topic": "Arrays & Hashing",
        "title": "Two Sum",
        "difficulty": "easy",
        "function_name": "two_sum",
        "parameter_names": ["nums", "target"],
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "test_cases": [
            {"input": {"nums": [2, 7, 11, 15], "target": 9}, "output": [0, 1]},
            {"input": {"nums": [3, 2, 4], "target": 6}, "output": [1, 2]},
            {"input": {"nums": [3, 3], "target": 6}, "output": [0, 1]}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Valid Anagram",
        "difficulty": "easy",
        "function_name": "is_anagram",
        "parameter_names": ["s", "t"],
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        "test_cases": [
            {"input": {"s": "anagram", "t": "nagaram"}, "output": True},
            {"input": {"s": "rat", "t": "car"}, "output": False}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Contains Duplicate",
        "difficulty": "easy",
        "function_name": "contains_duplicate",
        "parameter_names": ["nums"],
        "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        "test_cases": [
            {"input": {"nums": [1, 2, 3, 1]}, "output": True},
            {"input": {"nums": [1, 2, 3, 4]}, "output": False},
            {"input": {"nums": [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]}, "output": True}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Group Anagrams",
        "difficulty": "medium",
        "function_name": "group_anagrams",
        "parameter_names": ["strs"],
        "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        "test_cases": [
            {"input": {"strs": ["eat", "tea", "tan", "ate", "nat", "bat"]}, "output": [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]},
            {"input": {"strs": [""]}, "output": [[""]]}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Top K Frequent Elements",
        "difficulty": "medium",
        "function_name": "top_k_frequent",
        "parameter_names": ["nums", "k"],
        "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
        "test_cases": [
            {"input": {"nums": [1, 1, 1, 2, 2, 3], "k": 2}, "output": [1, 2]},
            {"input": {"nums": [1], "k": 1}, "output": [1]}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Product of Array Except Self",
        "difficulty": "medium",
        "function_name": "product_except_self",
        "parameter_names": ["nums"],
        "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.",
        "test_cases": [
            {"input": {"nums": [1, 2, 3, 4]}, "output": [24, 12, 8, 6]},
            {"input": {"nums": [-1, 1, 0, -3, 3]}, "output": [0, 0, 9, 0, 0]}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Valid Sudoku",
        "difficulty": "medium",
        "function_name": "is_valid_sudoku",
        "parameter_names": ["board"],
        "description": "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n1. Each row must contain the digits 1-9 without repetition.\n2. Each column must contain the digits 1-9 without repetition.\n3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.",
        "test_cases": [
            {"input": {"board": [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]}, "output": True}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Encode and Decode Strings",
        "difficulty": "medium",
        "function_name": "encode_decode",
        "parameter_names": ["strs"],
        "description": "Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings. (Test this by returning the decoded output of your encoding logic).",
        "test_cases": [
            {"input": {"strs": ["neet","code","love","you"]}, "output": ["neet","code","love","you"]}
        ]
    },
    {
        "topic": "Arrays & Hashing",
        "title": "Longest Consecutive Sequence",
        "difficulty": "medium",
        "function_name": "longest_consecutive",
        "parameter_names": ["nums"],
        "description": "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
        "test_cases": [
            {"input": {"nums": [100, 4, 200, 1, 3, 2]}, "output": 4},
            {"input": {"nums": [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]}, "output": 9}
        ]
    },

    # Two Pointers
    {
        "topic": "Two Pointers",
        "title": "Valid Palindrome",
        "difficulty": "easy",
        "function_name": "is_palindrome",
        "parameter_names": ["s"],
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        "test_cases": [
            {"input": {"s": "A man, a plan, a canal: Panama"}, "output": True},
            {"input": {"s": "race a car"}, "output": False}
        ]
    },
    {
        "topic": "Two Pointers",
        "title": "Two Sum II - Input Array Is Sorted",
        "difficulty": "medium",
        "function_name": "two_sum",
        "parameter_names": ["numbers", "target"],
        "description": "Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number. Let these two numbers be `numbers[index1]` and `numbers[index2]` where 1 <= index1 < index2 <= numbers.length.\n\nReturn the indices of the two numbers, `index1` and `index2`, added by one as an integer array `[index1, index2]` of length 2.",
        "test_cases": [
            {"input": {"numbers": [2, 7, 11, 15], "target": 9}, "output": [1, 2]},
            {"input": {"numbers": [2, 3, 4], "target": 6}, "output": [1, 3]}
        ]
    },
    {
        "topic": "Two Pointers",
        "title": "3Sum",
        "difficulty": "medium",
        "function_name": "three_sum",
        "parameter_names": ["nums"],
        "description": "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        "test_cases": [
            {"input": {"nums": [-1, 0, 1, 2, -1, -4]}, "output": [[-1, -1, 2], [-1, 0, 1]]},
            {"input": {"nums": [0, 1, 1]}, "output": []}
        ]
    },
    {
        "topic": "Two Pointers",
        "title": "Container With Most Water",
        "difficulty": "medium",
        "function_name": "max_area",
        "parameter_names": ["height"],
        "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `ith` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\nReturn the maximum amount of water a container can store.",
        "test_cases": [
            {"input": {"height": [1,8,6,2,5,4,8,3,7]}, "output": 49},
            {"input": {"height": [1,1]}, "output": 1}
        ]
    },
    {
        "topic": "Two Pointers",
        "title": "Trapping Rain Water",
        "difficulty": "hard",
        "function_name": "trap",
        "parameter_names": ["height"],
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "test_cases": [
            {"input": {"height": [0,1,0,2,1,0,1,3,2,1,2,1]}, "output": 6},
            {"input": {"height": [4,2,0,3,2,5]}, "output": 9}
        ]
    },

    # Sliding Window
    {
        "topic": "Sliding Window",
        "title": "Best Time to Buy and Sell Stock",
        "difficulty": "easy",
        "function_name": "max_profit",
        "parameter_names": ["prices"],
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "test_cases": [
            {"input": {"prices": [7,1,5,3,6,4]}, "output": 5},
            {"input": {"prices": [7,6,4,3,1]}, "output": 0}
        ]
    },
    {
        "topic": "Sliding Window",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "medium",
        "function_name": "length_of_longest_substring",
        "parameter_names": ["s"],
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "test_cases": [
            {"input": {"s": "abcabcbb"}, "output": 3},
            {"input": {"s": "bbbbb"}, "output": 1},
            {"input": {"s": "pwwkew"}, "output": 3}
        ]
    },
    {
        "topic": "Sliding Window",
        "title": "Longest Repeating Character Replacement",
        "difficulty": "medium",
        "function_name": "character_replacement",
        "parameter_names": ["s", "k"],
        "description": "You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
        "test_cases": [
            {"input": {"s": "ABAB", "k": 2}, "output": 4},
            {"input": {"s": "AABABBA", "k": 1}, "output": 4}
        ]
    },
    {
        "topic": "Sliding Window",
        "title": "Minimum Window Substring",
        "difficulty": "hard",
        "function_name": "min_window",
        "parameter_names": ["s", "t"],
        "description": "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `\"\"`.",
        "test_cases": [
            {"input": {"s": "ADOBECODEBANC", "t": "ABC"}, "output": "BANC"},
            {"input": {"s": "a", "t": "a"}, "output": "a"}
        ]
    },
    
    # Stack
    {
        "topic": "Stack",
        "title": "Valid Parentheses",
        "difficulty": "easy",
        "function_name": "is_valid",
        "parameter_names": ["s"],
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
        "test_cases": [
            {"input": {"s": "()"}, "output": True},
            {"input": {"s": "()[]{}"}, "output": True},
            {"input": {"s": "(]"}, "output": False}
        ]
    },
    {
        "topic": "Stack",
        "title": "Min Stack",
        "difficulty": "medium",
        "function_name": "min_stack_ops",
        "parameter_names": ["operations", "values"],
        "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class (For this test system, return the results of the operations in a list).",
        "test_cases": [
            {"input": {"operations": ["push", "push", "push", "getMin", "pop", "top", "getMin"], "values": [[-2], [0], [-3], [], [], [], []]}, "output": [None, None, None, -3, None, 0, -2]}
        ]
    },
    {
        "topic": "Stack",
        "title": "Evaluate Reverse Polish Notation",
        "difficulty": "medium",
        "function_name": "eval_rpn",
        "parameter_names": ["tokens"],
        "description": "You are given an array of strings `tokens` that represents an arithmetic expression in a Reverse Polish Notation.\nEvaluate the expression. Return an integer that represents the value of the expression.",
        "test_cases": [
            {"input": {"tokens": ["2","1","+","3","*"]}, "output": 9},
            {"input": {"tokens": ["4","13","5","/","+"]}, "output": 6}
        ]
    },
    {
        "topic": "Stack",
        "title": "Generate Parentheses",
        "difficulty": "medium",
        "function_name": "generate_parenthesis",
        "parameter_names": ["n"],
        "description": "Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        "test_cases": [
            {"input": {"n": 3}, "output": ["((()))","(()())","(())()","()(())","()()()"]},
            {"input": {"n": 1}, "output": ["()"]}
        ]
    },
    {
        "topic": "Stack",
        "title": "Daily Temperatures",
        "difficulty": "medium",
        "function_name": "daily_temperatures",
        "parameter_names": ["temperatures"],
        "description": "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `ith` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.",
        "test_cases": [
            {"input": {"temperatures": [73,74,75,71,69,72,76,73]}, "output": [1,1,4,2,1,1,0,0]}
        ]
    },

    # Binary Search
    {
        "topic": "Binary Search",
        "title": "Binary Search",
        "difficulty": "easy",
        "function_name": "search",
        "parameter_names": ["nums", "target"],
        "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        "test_cases": [
            {"input": {"nums": [-1,0,3,5,9,12], "target": 9}, "output": 4},
            {"input": {"nums": [-1,0,3,5,9,12], "target": 2}, "output": -1}
        ]
    },
    {
        "topic": "Binary Search",
        "title": "Search a 2D Matrix",
        "difficulty": "medium",
        "function_name": "search_matrix",
        "parameter_names": ["matrix", "target"],
        "description": "You are given an `m x n` integer matrix `matrix` with the following two properties:\n- Each row is sorted in non-decreasing order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer `target`, return `true` if `target` is in `matrix` or `false` otherwise.",
        "test_cases": [
            {"input": {"matrix": [[1,3,5,7],[10,11,16,20],[23,30,34,60]], "target": 3}, "output": True},
            {"input": {"matrix": [[1,3,5,7],[10,11,16,20],[23,30,34,60]], "target": 13}, "output": False}
        ]
    },
    {
        "topic": "Binary Search",
        "title": "Koko Eating Bananas",
        "difficulty": "medium",
        "function_name": "min_eating_speed",
        "parameter_names": ["piles", "h"],
        "description": "Koko loves to eat bananas. There are `n` piles of bananas, the `ith` pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours.\n\nKoko can decide her bananas-per-hour eating speed of `k`. Each hour, she chooses some pile of bananas and eats `k` bananas from that pile.\nReturn the minimum integer `k` such that she can eat all the bananas within `h` hours.",
        "test_cases": [
            {"input": {"piles": [3,6,7,11], "h": 8}, "output": 4},
            {"input": {"piles": [30,11,23,4,20], "h": 5}, "output": 30}
        ]
    },
    {
        "topic": "Binary Search",
        "title": "Find Minimum in Rotated Sorted Array",
        "difficulty": "medium",
        "function_name": "find_min",
        "parameter_names": ["nums"],
        "description": "Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times.\nGiven the sorted rotated array `nums` of unique elements, return the minimum element of this array.",
        "test_cases": [
            {"input": {"nums": [3,4,5,1,2]}, "output": 1},
            {"input": {"nums": [4,5,6,7,0,1,2]}, "output": 0}
        ]
    },
    {
        "topic": "Binary Search",
        "title": "Search in Rotated Sorted Array",
        "difficulty": "medium",
        "function_name": "search",
        "parameter_names": ["nums", "target"],
        "description": "There is an integer array `nums` sorted in ascending order (with distinct values).\nPrior to being passed to your function, `nums` is possibly rotated.\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.",
        "test_cases": [
            {"input": {"nums": [4,5,6,7,0,1,2], "target": 0}, "output": 4},
            {"input": {"nums": [4,5,6,7,0,1,2], "target": 3}, "output": -1}
        ]
    },

    # Linked List
    {
        "topic": "Linked List",
        "title": "Reverse Linked List",
        "difficulty": "easy",
        "function_name": "reverse_list",
        "parameter_names": ["head"],
        "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list. (Note: for testing, input is an array that is converted to a linked list behind the scenes).",
        "test_cases": [
            {"input": {"head": [1,2,3,4,5]}, "output": [5,4,3,2,1]},
            {"input": {"head": [1,2]}, "output": [2,1]}
        ]
    },
    {
        "topic": "Linked List",
        "title": "Merge Two Sorted Lists",
        "difficulty": "easy",
        "function_name": "merge_two_lists",
        "parameter_names": ["list1", "list2"],
        "description": "You are given the heads of two sorted linked lists `list1` and `list2`.\nMerge the two lists into one sorted list.",
        "test_cases": [
            {"input": {"list1": [1,2,4], "list2": [1,3,4]}, "output": [1,1,2,3,4,4]},
            {"input": {"list1": [], "list2": [0]}, "output": [0]}
        ]
    },
    {
        "topic": "Linked List",
        "title": "Reorder List",
        "difficulty": "medium",
        "function_name": "reorder_list",
        "parameter_names": ["head"],
        "description": "You are given the head of a singly linked-list. The list can be represented as:\n`L0 → L1 → … → Ln - 1 → Ln`\nReorder the list to be on the following form:\n`L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …`",
        "test_cases": [
            {"input": {"head": [1,2,3,4]}, "output": [1,4,2,3]},
            {"input": {"head": [1,2,3,4,5]}, "output": [1,5,2,4,3]}
        ]
    },
    {
        "topic": "Linked List",
        "title": "Remove Nth Node From End of List",
        "difficulty": "medium",
        "function_name": "remove_nth_from_end",
        "parameter_names": ["head", "n"],
        "description": "Given the `head` of a linked list, remove the `nth` node from the end of the list and return its head.",
        "test_cases": [
            {"input": {"head": [1,2,3,4,5], "n": 2}, "output": [1,2,3,5]},
            {"input": {"head": [1], "n": 1}, "output": []}
        ]
    },

    # Trees
    {
        "topic": "Trees",
        "title": "Invert Binary Tree",
        "difficulty": "easy",
        "function_name": "invert_tree",
        "parameter_names": ["root"],
        "description": "Given the `root` of a binary tree, invert the tree, and return its root.",
        "test_cases": [
            {"input": {"root": [4,2,7,1,3,6,9]}, "output": [4,7,2,9,6,3,1]},
            {"input": {"root": [2,1,3]}, "output": [2,3,1]}
        ]
    },
    {
        "topic": "Trees",
        "title": "Maximum Depth of Binary Tree",
        "difficulty": "easy",
        "function_name": "max_depth",
        "parameter_names": ["root"],
        "description": "Given the `root` of a binary tree, return its maximum depth.",
        "test_cases": [
            {"input": {"root": [3,9,20,None,None,15,7]}, "output": 3},
            {"input": {"root": [1,None,2]}, "output": 2}
        ]
    },
    {
        "topic": "Trees",
        "title": "Same Tree",
        "difficulty": "easy",
        "function_name": "is_same_tree",
        "parameter_names": ["p", "q"],
        "description": "Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.",
        "test_cases": [
            {"input": {"p": [1,2,3], "q": [1,2,3]}, "output": True},
            {"input": {"p": [1,2], "q": [1,None,2]}, "output": False}
        ]
    },
    {
        "topic": "Trees",
        "title": "Subtree of Another Tree",
        "difficulty": "easy",
        "function_name": "is_subtree",
        "parameter_names": ["root", "subRoot"],
        "description": "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the same structure and node values of `subRoot` and `false` otherwise.",
        "test_cases": [
            {"input": {"root": [3,4,5,1,2], "subRoot": [4,1,2]}, "output": True},
            {"input": {"root": [3,4,5,1,2,None,None,None,None,0], "subRoot": [4,1,2]}, "output": False}
        ]
    },
    {
        "topic": "Trees",
        "title": "Lowest Common Ancestor of a Binary Search Tree",
        "difficulty": "medium",
        "function_name": "lowest_common_ancestor",
        "parameter_names": ["root", "p", "q"],
        "description": "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
        "test_cases": [
            {"input": {"root": [6,2,8,0,4,7,9,None,None,3,5], "p": 2, "q": 8}, "output": 6},
            {"input": {"root": [6,2,8,0,4,7,9,None,None,3,5], "p": 2, "q": 4}, "output": 2}
        ]
    },

    # Dynamic Programming
    {
        "topic": "Dynamic Programming",
        "title": "Climbing Stairs",
        "difficulty": "easy",
        "function_name": "climb_stairs",
        "parameter_names": ["n"],
        "description": "You are climbing a staircase. It takes `n` steps to reach the top.\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "test_cases": [
            {"input": {"n": 2}, "output": 2},
            {"input": {"n": 3}, "output": 3}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "House Robber",
        "difficulty": "medium",
        "function_name": "rob",
        "parameter_names": ["nums"],
        "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        "test_cases": [
            {"input": {"nums": [1,2,3,1]}, "output": 4},
            {"input": {"nums": [2,7,9,3,1]}, "output": 12}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "House Robber II",
        "difficulty": "medium",
        "function_name": "rob_ii",
        "parameter_names": ["nums"],
        "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        "test_cases": [
            {"input": {"nums": [2,3,2]}, "output": 3},
            {"input": {"nums": [1,2,3,1]}, "output": 4}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Longest Palindromic Substring",
        "difficulty": "medium",
        "function_name": "longest_palindrome",
        "parameter_names": ["s"],
        "description": "Given a string `s`, return the longest palindromic substring in `s`.",
        "test_cases": [
            {"input": {"s": "babad"}, "output": "bab"},
            {"input": {"s": "cbbd"}, "output": "bb"}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Palindromic Substrings",
        "difficulty": "medium",
        "function_name": "count_substrings",
        "parameter_names": ["s"],
        "description": "Given a string `s`, return the number of palindromic substrings in it.\n\nA string is a palindrome when it reads the same backward as forward.",
        "test_cases": [
            {"input": {"s": "abc"}, "output": 3},
            {"input": {"s": "aaa"}, "output": 6}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Decode Ways",
        "difficulty": "medium",
        "function_name": "num_decodings",
        "parameter_names": ["s"],
        "description": "A message containing letters from A-Z can be encoded into numbers using the following mapping: 'A' -> \"1\", 'B' -> \"2\", ... 'Z' -> \"26\".\n\nGiven a string `s` containing only digits, return the number of ways to decode it.",
        "test_cases": [
            {"input": {"s": "12"}, "output": 2},
            {"input": {"s": "226"}, "output": 3},
            {"input": {"s": "06"}, "output": 0}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Coin Change",
        "difficulty": "medium",
        "function_name": "coin_change",
        "parameter_names": ["coins", "amount"],
        "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
        "test_cases": [
            {"input": {"coins": [1,2,5], "amount": 11}, "output": 3},
            {"input": {"coins": [2], "amount": 3}, "output": -1}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Maximum Product Subarray",
        "difficulty": "medium",
        "function_name": "max_product",
        "parameter_names": ["nums"],
        "description": "Given an integer array `nums`, find a subarray that has the largest product, and return the product.",
        "test_cases": [
            {"input": {"nums": [2,3,-2,4]}, "output": 6},
            {"input": {"nums": [-2,0,-1]}, "output": 0}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Word Break",
        "difficulty": "medium",
        "function_name": "word_break",
        "parameter_names": ["s", "wordDict"],
        "description": "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.",
        "test_cases": [
            {"input": {"s": "leetcode", "wordDict": ["leet","code"]}, "output": True},
            {"input": {"s": "applepenapple", "wordDict": ["apple","pen"]}, "output": True},
            {"input": {"s": "catsandog", "wordDict": ["cats","dog","sand","and","cat"]}, "output": False}
        ]
    },
    {
        "topic": "Dynamic Programming",
        "title": "Longest Increasing Subsequence",
        "difficulty": "medium",
        "function_name": "length_of_lis",
        "parameter_names": ["nums"],
        "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
        "test_cases": [
            {"input": {"nums": [10,9,2,5,3,7,101,18]}, "output": 4},
            {"input": {"nums": [0,1,0,3,2,3]}, "output": 4}
        ]
    }
]
