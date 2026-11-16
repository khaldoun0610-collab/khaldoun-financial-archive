import os
import sys
import re
import time
import subprocess
import webbrowser
import urllib.request

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_EXE = os.path.join(WORKSPACE_DIR, "cloudflared.exe")
STORAGE_DIR = os.path.join(WORKSPACE_DIR, "storage")
URL_FILE = os.path.join(STORAGE_DIR, "public_url.txt")

def is_server_running(url="http://127.0.0.1:8000/"):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False

def ensure_server_running():
    if is_server_running():
        print("  [OK] خادم خلدون المالي يعمل بالفعل على: http://127.0.0.1:8000")
        return None
    
    print("  [..] جاري بدء تشغيل خادم خلدون للأرشيف المالي (FastAPI + Uvicorn)...")
    backend_dir = os.path.join(WORKSPACE_DIR, "backend")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
    )
    for _ in range(15):
        time.sleep(1)
        if is_server_running():
            print("  [OK] تم بدء الخادم بنجاح على: http://127.0.0.1:8000")
            return proc
    print("  [!] تنبيه: جاري الانتظار حتى اكتمال إقلاع الخادم...")
    return proc

def main():
    print("=" * 72)
    print("        خلدون للأرشيف المالي | Khaldoun Financial Archive")
    print("     تشغيل الدومين السحابي السريع المجاني (Cloudflare Global CDN)")
    print("=" * 72)
    print()

    # 1. التأكد من تشغيل السيرفر المحلي
    server_proc = ensure_server_running()

    # 2. التأكد من وجود أداة cloudflared
    if not os.path.exists(CLOUDFLARED_EXE):
        print("  [..] جاري تحميل أداة Cloudflare Tunnel الرسمية...")
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        try:
            urllib.request.urlretrieve(url, CLOUDFLARED_EXE)
            print("  [OK] تم تحميل أداة Cloudflare بنجاح!")
        except Exception as e:
            print(f"  [X] فشل التحميل التلقائي: {e}")
            print(f"  يرجى تنزيل الملف يدوياً ووضعه في: {CLOUDFLARED_EXE}")
            input("اضغط Enter للخروج...")
            return

    # 3. تشغيل النفق السحابي
    print("  [..] جاري فتح النفق السحابي العالمي وربطه بماكينة التصوير والأرشيف...")
    tunnel_cmd = [CLOUDFLARED_EXE, "tunnel", "--url", "http://127.0.0.1:8000"]
    
    tunnel_proc = subprocess.Popen(
        tunnel_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore",
        bufsize=1
    )

    public_url = None
    url_regex = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

    # قراءة المخرجات لاستخراج رابط الدومين المجاني
    for line in tunnel_proc.stdout:
        match = url_regex.search(line)
        if match:
            public_url = match.group(0)
            break
        if "error" in line.lower() and "failed" in line.lower():
            print(f"  [!] {line.strip()}")

    if public_url:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        with open(URL_FILE, "w", encoding="utf-8") as f:
            f.write(public_url)

        print()
        print("+" + "-" * 70 + "+")
        print("|  تهانينا! موقع خلدون للأرشيف المالي متاح الآن على الإنترنت بنجاح! |")
        print("+" + "-" * 70 + "+")
        print(f"|  رابط الدومين السحابي السريع:                                        |")
        print(f"|  \033[92m{public_url}\033[0m")
        print("+" + "-" * 70 + "+")
        print(f"|  الرابط المحلي الداخلي:  http://127.0.0.1:8000                       |")
        print(f"|  مسار سحب الماكينات:   \\\\192.168.100.5\\incoming_scans               |")
        print(f"|  شهادة الأمان:          SSL / HTTPS مشفرة ومعتمدة تلقائياً           |")
        print(f"|  سرعة الاستجابة:        فائقة جداً (مدعوم بشبكة Cloudflare Edge CDN) |")
        print("+" + "-" * 70 + "+")
        print()
        print("  💡 يمكنك إرسال هذا الرابط إلى الموبايل أو أي جهاز في العالم لتصفح الأرشيف فوراً!")
        print("  ⚠️ اترك هذه النافذة مفتوحة طوال فترة رغبتك في إتاحة الموقع خارجياً.")
        print()

        try:
            webbrowser.open(public_url)
        except Exception:
            pass
    else:
        print("  [!] لم يتم رصد رابط النفق السحابي، تأكد من اتصال الإنترنت.")

    try:
        tunnel_proc.wait()
    except KeyboardInterrupt:
        print("\n  [..] جاري إغلاق النفق السحابي...")
        tunnel_proc.terminate()
        if server_proc:
            server_proc.terminate()
        print("  [OK] تم الإنهاء بأمان.")

if __name__ == "__main__":
    main()
