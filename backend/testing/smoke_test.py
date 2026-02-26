import asyncio
import json
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

import websockets


BASE_DIR = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PORT = 8001
BASE_URL = f"http://{HOST}:{PORT}"
WS_URL = f"ws://{HOST}:{PORT}/ws-transcribe"


def http_get(path: str) -> tuple[int, dict | str]:
    request = urllib.request.Request(f"{BASE_URL}{path}", method="GET")
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        content_type = response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            return response.status, json.loads(body)
        return response.status, body


def http_post_json(path: str, payload: dict) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        return response.status, json.loads(body)


def http_post_form(path: str, form_payload: dict[str, str]) -> tuple[int, dict]:
    data = urllib.parse.urlencode(form_payload).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        return response.status, json.loads(body)


def http_get_with_headers(path: str, headers: dict[str, str]) -> tuple[int, dict | str]:
    request = urllib.request.Request(f"{BASE_URL}{path}", method="GET", headers=headers)
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        content_type = response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            return response.status, json.loads(body)
        return response.status, body


def http_post_multipart_file(path: str, field_name: str, file_name: str, content: bytes, content_type: str) -> tuple[int, dict]:
    boundary = f"----SmokeBoundary{uuid.uuid4().hex}"
    lines: list[bytes] = [
        f"--{boundary}".encode("utf-8"),
        f'Content-Disposition: form-data; name="{field_name}"; filename="{file_name}"'.encode("utf-8"),
        f"Content-Type: {content_type}".encode("utf-8"),
        b"",
        content,
        f"--{boundary}--".encode("utf-8"),
        b"",
    ]
    body = b"\r\n".join(lines)

    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        response_body = response.read().decode("utf-8")
        return response.status, json.loads(response_body)


def wait_for_server(timeout_seconds: int = 20) -> None:
    start = time.time()
    last_error = ""

    while time.time() - start < timeout_seconds:
        try:
            status, _ = http_get("/openapi.json")
            if status == 200:
                return
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            time.sleep(0.5)

    raise RuntimeError(f"Server did not become ready within {timeout_seconds}s. Last error: {last_error}")


async def websocket_check() -> tuple[bool, str]:
    try:
        async with websockets.connect(WS_URL) as ws:
            await ws.send(b"dummy-audio")
            message = await asyncio.wait_for(ws.recv(), timeout=10)
            payload = json.loads(message)
            transcript = payload.get("transcript")
            is_final = payload.get("is_final")
            if transcript and isinstance(is_final, bool):
                return True, f"/ws-transcribe ok: transcript='{transcript}', is_final={is_final}"
            return False, f"/ws-transcribe invalid payload: {payload}"
    except Exception as exc:  # noqa: BLE001
        return False, f"/ws-transcribe failed: {exc}"


def run_smoke_tests() -> int:
    checks: list[tuple[bool, str]] = []

    try:
        status, root_data = http_get("/")
        checks.append((status == 200 and isinstance(root_data, dict), f"GET / -> {status}, body={root_data}"))

        status, status_data = http_get("/status")
        checks.append((status == 200 and isinstance(status_data, dict), f"GET /status -> {status}, body keys={list(status_data.keys())}"))

        status, docs_data = http_get("/docs")
        checks.append((status == 200 and isinstance(docs_data, str), f"GET /docs -> {status}"))

        # Auth flow smoke test: signup -> login -> protected endpoint.
        unique_email = f"smoke_{uuid.uuid4().hex[:10]}@example.com"
        status, signup_data = http_post_json(
            "/auth/signup",
            {
                "full_name": "Smoke Test User",
                "email": unique_email,
                "password": "StrongPass123",
                "phone": "9999999999",
                "state": "KA",
            },
        )
        checks.append(
            (
                status == 201 and signup_data.get("email") == unique_email,
                f"POST /auth/signup -> {status}, body={signup_data}",
            )
        )

        status, login_data = http_post_form(
            "/auth/login",
            {
                "username": unique_email,
                "password": "StrongPass123",
            },
        )
        token = login_data.get("access_token", "")
        checks.append(
            (
                status == 200 and bool(token),
                f"POST /auth/login -> {status}, token_present={bool(token)}",
            )
        )

        status, protected_data = http_get_with_headers(
            "/auth/protected",
            {"Authorization": f"Bearer {token}"},
        )
        checks.append(
            (
                status == 200 and isinstance(protected_data, dict) and protected_data.get("user", {}).get("email") == unique_email,
                f"GET /auth/protected -> {status}, body={protected_data}",
            )
        )

        status, triage_data = http_post_json(
            "/triage",
            {"symptom_text": "I have fever and cough", "session_id": "smoke-test"},
        )
        checks.append(
            (
                status == 200 and "risk_level" in triage_data and "guidance" in triage_data,
                f"POST /triage -> {status}, body={triage_data}",
            )
        )

        status, eligibility_data = http_post_json(
            "/eligibility",
            {
                "income": 180000,
                "age": 62,
                "state": "KA",
                "bpl_card": True,
                "household_type": "rural",
                "session_id": "smoke-test",
            },
        )
        checks.append(
            (
                status == 200 and "eligible" in eligibility_data,
                f"POST /eligibility -> {status}, body={eligibility_data}",
            )
        )

        status, transcribe_data = http_post_multipart_file(
            "/transcribe",
            field_name="file",
            file_name="sample.wav",
            content=b"dummy-audio-bytes",
            content_type="audio/wav",
        )
        checks.append(
            (
                status == 200 and "transcript" in transcribe_data,
                f"POST /transcribe -> {status}, body={transcribe_data}",
            )
        )

        ws_ok, ws_message = asyncio.run(websocket_check())
        checks.append((ws_ok, ws_message))

    except urllib.error.HTTPError as exc:
        checks.append((False, f"HTTPError: {exc.code} {exc.reason}"))
    except Exception as exc:  # noqa: BLE001
        checks.append((False, f"Unexpected error: {exc}"))

    print("\nSmoke test results:")
    all_ok = True
    for ok, message in checks:
        prefix = "[PASS]" if ok else "[FAIL]"
        print(f"{prefix} {message}")
        all_ok = all_ok and ok

    return 0 if all_ok else 1


def main() -> int:
    command = [sys.executable, "-m", "uvicorn", "main:app", "--host", HOST, "--port", str(PORT)]
    server = subprocess.Popen(
        command,
        cwd=BASE_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_server()
        return run_smoke_tests()
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    raise SystemExit(main())
