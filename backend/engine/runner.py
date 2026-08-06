import subprocess
import sys
import json
import tempfile
import os
import textwrap

def run_python_submission(submission_code, function_name, test_cases):
    """
    Executes a Python code submission against a query set of TestCases.
    """
    passed_count = 0
    total_count = len(test_cases)
    total_runtime = 0.0
    last_stdout = ""
    
    if total_count == 0:
        return {
            "status": "ACCEPTED",
            "passed": 0,
            "total": 0,
            "runtime": 0.0,
            "stdout": "No test cases configured.",
            "error_message": None
        }

    for case in test_cases:
        inputs = case.input_data  
        expected = case.expected_output  
        
        # Inject the expected function name into our wrapper
        # CRITICAL: Keep these lines completely flush against the left wall of the string literal
        wrapper_code =f"""import json
import time
import sys

# User's submitted solution code
{submission_code}

if __name__ == "__main__":
    try:
        inputs = {json.dumps(inputs)}
        
        if "{function_name}" not in locals() and "{function_name}" not in globals():
            raise NameError("Function '{function_name}' is not defined in your code.")
            
        start_time = time.perf_counter()
        actual_output = locals().get("{function_name}", globals().get("{function_name}"))(**inputs)
        end_time = time.perf_counter()
        
        response = {{
            "result": actual_output,
            "runtime": end_time - start_time
        }}
        print(json.dumps(response))
        
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)
"""
                                
        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w') as temp_file:
            temp_file.write(wrapper_code)
            temp_path = temp_file.name

        try:
            process = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=2.0
            )
            
            if process.returncode != 0:
                return {
                    "status": "RUNTIME_ERROR",
                    "passed": passed_count,
                    "total": total_count,
                    "runtime": total_runtime,
                    "stdout": process.stdout,
                    "error_message": process.stderr.strip() or "Process exited with non-zero return code."
                }
            
            # Extract standard output lines
            lines = process.stdout.strip().splitlines()
            if not lines:
                raise ValueError("No output generated.")
                
            last_line = lines[-1] # The JSON envelope is guaranteed to be the final line
            user_debug_prints = "\n".join(lines[:-1]) # Capture any print() statements the user added
            
            try:
                output_envelope = json.loads(last_line)
                actual_result = output_envelope["result"]
                case_runtime = output_envelope["runtime"]
            except (json.JSONDecodeError, KeyError):
                return {
                    "status": "RUNTIME_ERROR",
                    "passed": passed_count,
                    "total": total_count,
                    "runtime": total_runtime,
                    "stdout": process.stdout,
                    "error_message": "Failed to parse program execution output. Check your return statements."
                }
            
            total_runtime += case_runtime
            last_stdout = user_debug_prints if user_debug_prints else str(actual_result)
            
            if actual_result == expected:
                passed_count += 1
            else:
                return {
                    "status": "WRONG_ANSWER",
                    "passed": passed_count,
                    "total": total_count,
                    "runtime": total_runtime,
                    "stdout": last_stdout,
                    "error_message": f"Test case failed. Input: {inputs}. Expected: {expected}, Got: {actual_result}"
                }
                
        except subprocess.TimeoutExpired:
            return {
                "status": "TIME_LIMIT_EXCEEDED",
                "passed": passed_count,
                "total": total_count,
                "runtime": 2.0,
                "stdout": "",
                "error_message": "Time Limit Exceeded. Your code took too long to execute."
            }
        
        finally:
            # Bulletproof cleanup guarantees no orphaned temp files
            if os.path.exists(temp_path):
                os.remove(temp_path)

    return {
        "status": "ACCEPTED",
        "passed": passed_count,
        "total": total_count,
        "runtime": round(total_runtime, 4),
        "stdout": last_stdout,
        "error_message": None
    }