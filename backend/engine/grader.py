import json
from .docker_runner import run_submission as docker_run
from .harnesses import build_python_source,build_java_source,build_c_source

def run_submission(language: str, code: str, problem,test_cases):
    function_name = problem.function_name
    parameter_names = problem.parameter_names

    passed_count = 0
    total_count = len(test_cases)
    stdout_log = []
    total_runtime_ms = 0
    error_message = ""
    status = "ACCEPTED"

    for tc in test_cases:
        try:
            if language == "python":
                source = build_python_source(code,function_name,parameter_names)
                stdin_data= json.dumps(tc.input_data)
            elif language == "java":
                source = build_java_source(
                    code,function_name,parameter_names,
                    problem.parameter_types,problem.return_type,
                )
                stdin_data = json.dumps(tc.input_data)
            elif language == "c":
                source = build_c_source(
                    code, function_name, parameter_names,
                    problem.parameter_types, problem.return_type,
                )
                # C harness reads space-separated scalars in parameter_names order,
                # not JSON - see docstring in harnesses.build_c_source.
                stdin_data = " ".join(str(tc.input_data[name]) for name in parameter_names)
            else:
                return _error_result(f"Unsupported Language: {language}")
        except ValueError as e:
            return _error_result(str(e))

        result = docker_run(language,source,stdin_data)
        total_runtime_ms += result.runtime_ms

        if result.timed_out:
            status = "TIME_LIMIT_EXCEEDED"
            error_message = f"Time limit exceeded on test case {tc.id}."
            break

        if not result.passed:
            status = "RUNTIME_ERROR"
            error_message = result.stderr.strip()[:2000]
            stdout_log.append(result.stdout)
            break

        actual_output = result.stdout.strip()
        expected_output = str(tc.expected_output).strip()

        try:
            is_match = json.loads(actual_output) == json.loads(expected_output)
        except (json.JSONDecodeError, ValueError):
            is_match = actual_output.strip().lower() == expected_output.strip().lower()

        if is_match:
            passed_count += 1
        else:
            status = "WRONG_ANSWER"
            error_message = (
                f"Test case {tc.id} failed.\n"
                f"Expected: {expected_output}\nGot: {actual_output}"
            )
            stdout_log.append(actual_output)
            break

        stdout_log.append(actual_output)

    if passed_count == total_count and total_count > 0:
        status = "ACCEPTED"
        error_message = ""

    return {
        "status": status,
        "passed": passed_count,
        "total": total_count,
        "runtime": total_runtime_ms,
        "stdout": "\n".join(stdout_log),
        "error_message": error_message,
    }



def _error_result(message:str):
    return {
        "status" : "ERROR",
        "passed" : 0,
        "total" : 0,
        "runtime" : 0,
        "stdout" : "",
        "error_message" : message,
    }