import json
import subprocess
import tempfile
import os
import uuid
from dataclasses import dataclass

@dataclass
class ExecutionResult:
    passed: bool
    stdout: str
    stderr: str
    exit_code: int
    timed_out: bool
    runtime_ms: int


LANGUAGE_CONFIGS = {
    "python":{
        "image":"codingprep-sandbox-python",
        "filename": "submission.py",
        "run_cmd" : ["python3","/sandbox/submission.py"],
        "needs_compile": False
    },
    "java": {
        "image":"codingprep-sandbox-java",
        "filename":"Main.java",
        "compile_cmd": ["javac","/sandbox/Main.java","-d","/sandbox"],
        "run_cmd" : ["java","-cp","/sandbox","Main"],
        "needs_compile":True
    },
    "c": {
        "image": "codingprep-sandbox-c",
        "filename": "submission.c",
        "compile_cmd": ["gcc", "/sandbox/submission.c", "-o", "/sandbox/submission", "-O2", "-Wall"],
        "run_cmd": ["/sandbox/submission"],
        "needs_compile": True,
    },
}

DOCKER_SECURITY_FLAGS = [
    "--rm",
    "--network", "none",
    "--memory", "128m",
    "--memory-swap", "128m",
    "--cpus", "0.5",
    "--pids-limit", "64",
    "--read-only",
    "--tmpfs", "/tmp:rw,size=16m",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--user", "nobody",
]

CONTAINER_TIMEOUT_SECONDS = 20
DOCKER_COMMAND_TIMEOUT_SECONDS = CONTAINER_TIMEOUT_SECONDS + 3  # buffer for container startup

def run_submission(language: str, source_code: str, stdin_data: str="") ->ExecutionResult:
    """
    Run `source_code` in an isolated Docker Container for the given language.
    stdin_data is piped to the program`s stdin
    """
    language = language.lower()
    if language not in LANGUAGE_CONFIGS:
        raise ValueError(f"Unsupported language: {language}")

    config = LANGUAGE_CONFIGS[language]
    run_id = uuid.uuid4().hex[:12]

    with tempfile.TemporaryDirectory(prefix=f"submission_{run_id}") as tmpdir:
        source_path = os.path.join(tmpdir,config["filename"])
        with open(source_path,"w") as f:
            f.write(source_code)
        os.chmod(source_path,0o644)

        volume_mount = f"{tmpdir}:/sandbox:rw"

        import time
        start = time.perf_counter()

        if config["needs_compile"]:
            compile_result = _docker_run(
                image=config["image"],
                volume_mount= volume_mount,
                cmd = config["compile_cmd"],
                stdin_data = "",
            )
            if compile_result.returncode != 0:
                elapsed_ms = int((time.perf_counter()-start) * 1000)
                return ExecutionResult(
                    passed=False,
                    stdout="",
                    stderr=f"Compilation Failed: \n{compile_result.stderr}",
                    exit_code=compile_result.returncode,
                    timed_out=False,
                    runtime_ms=elapsed_ms
                )
        run_result = _docker_run(
            image=config["image"],
            volume_mount=volume_mount,
            cmd=config["run_cmd"],
            stdin_data = stdin_data,
        )
        elapsed_ms = int((time.perf_counter()-start) * 1000)
        return ExecutionResult(
            passed=(run_result.returncode == 0),
            stdout=run_result.stdout,
            stderr=run_result.stderr,
            exit_code=run_result.returncode,
            timed_out=run_result.timed_out,
            runtime_ms=elapsed_ms,
        )


@dataclass
class _DockerRunResult:
    returncode: int
    stdout: str
    stderr: str
    timed_out: bool


def _docker_run(image:str, volume_mount: str,cmd: list, stdin_data: str) -> _DockerRunResult:
    full_cmd = (
        ["docker","run","-i","-v",volume_mount]
        + DOCKER_SECURITY_FLAGS
        +[image]
        +cmd
    )
    try:
        proc=subprocess.run(
            full_cmd,
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=DOCKER_COMMAND_TIMEOUT_SECONDS
        )
        return _DockerRunResult(
            returncode=proc.returncode,
            stdout=proc.stdout,
            stderr=proc.stderr,
            timed_out=False,
        )
    except subprocess.TimeoutExpired:
        return _DockerRunResult(
            returncode=-1,
            stdout="",
            stderr=f"Execution timed out after {CONTAINER_TIMEOUT_SECONDS}s",
            timed_out=True,
        )
