"""DailySpoke one-click launcher — starts backend + frontend, opens browser."""
import subprocess
import sys
import time
import webbrowser
import socket
import os


def is_port_free(port: int) -> bool:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        s.close()
        return True
    except OSError:
        return False


def kill_port(port: int):
    if is_port_free(port):
        return
    import signal as _sig
    for proc in subprocess.run(
        ["cmd", "/c", f'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :{port} ^| findstr LISTENING\') do taskkill /f /pid %a'],
        capture_output=True, text=True
    ).stdout.splitlines():
        pass


def main():
    python = r"C:\Users\92172\AppData\Local\Programs\Python\Python312\python.exe"
    project_dir = os.path.dirname(os.path.abspath(__file__))

    print("=" * 48)
    print("  DailySpoke — Starting...")
    print("=" * 48)

    # Kill old instances
    for port in (8000, 5173):
        kill_port(port)
    time.sleep(1)

    # Start Python backend
    print("[1/2] Starting Python TTS backend...")
    subprocess.Popen(
        [python, os.path.join(project_dir, "server", "tts_server.py")],
        cwd=project_dir,
        env={**os.environ, "PYTHONUTF8": "1"},
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )

    # Start frontend
    print("[2/2] Starting frontend...")
    subprocess.Popen(
        ["cmd", "/c", "npx vite --host"],
        cwd=project_dir,
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )

    # Wait for both to be ready
    for i in range(60):
        backend_ok = not is_port_free(8000)
        frontend_ok = not is_port_free(5173)
        if backend_ok and frontend_ok:
            break
        time.sleep(1)

    print("\n  Backend:  http://127.0.0.1:8000")
    print("  Frontend: http://127.0.0.1:5173")

    # Open browser
    print("\n  Opening browser...")
    webbrowser.open("http://127.0.0.1:5173")

    print("\n  Press Ctrl+C to stop both servers.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n  Shutting down...")
        kill_port(8000)
        kill_port(5173)
        print("  Done.")


if __name__ == "__main__":
    main()
