import socket
import subprocess
import re
import os
from datetime import datetime
from database import get_connection

def get_local_ip() -> str:
    """الحصول على عنوان IP لجهاز الكمبيوتر على الشبكة المحلية"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.100.5"

def test_ip_connection(ip: str, port: int = 80, timeout: float = 1.0) -> bool:
    """اختبار اتصال IP وما إذا كان الجهاز متصلاً بالشبكة المشتركة"""
    if not ip:
        return False
    # محاولة فحص منافذ الطابعات الشائعة (80 للوحة التحكم، 9100 للطباعة، 445 للشير)
    ports = [80, 443, 9100, 445, 515, 631]
    for p in ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.3)
            result = sock.connect_ex((ip, p))
            sock.close()
            if result == 0:
                return True
        except Exception:
            pass

    # فحص سريع عبر ping
    try:
        res = subprocess.run(["ping", "-n", "1", "-w", "500", ip], capture_output=True, text=True)
        return res.returncode == 0
    except Exception:
        return False

def discover_network_copiers():
    """
    فحص الشبكة المحلية المشتركة (ARP Table + Subnet Scan)
    لاكتشاف ماكينات التصوير والطابعات الذكية المتصلة
    """
    discovered = []
    local_ip = get_local_ip()
    subnet_prefix = ".".join(local_ip.split(".")[:3])

    # 1. فحص جدول ARP في الويندوز
    try:
        arp_out = subprocess.check_output("arp -a", shell=True, text=True)
        for line in arp_out.splitlines():
            line = line.strip()
            match = re.search(r'(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9\-]+)', line)
            if match:
                ip = match.group(1)
                mac = match.group(2)
                # استبعاد العناوين الخاصة بالبث (Broadcast) وبوابة الراوتر
                if ip.startswith(subnet_prefix) and not ip.endswith(".255") and not ip.endswith(".1") and ip != local_ip:
                    # فحص ما إذا كان الجهاز يفتح منافذ ماكينات التصوير
                    is_online = test_ip_connection(ip)
                    brand = guess_brand_by_mac(mac)
                    discovered.append({
                        "ip": ip,
                        "mac": mac,
                        "brand": brand,
                        "name": f"ماكينة {brand} ({ip})",
                        "status": "online" if is_online else "discovered"
                    })
    except Exception as e:
        print(f"ARP discovery error: {e}")

    return discovered

def guess_brand_by_mac(mac: str) -> str:
    """تخمين ماركة الماكينة (Ricoh, Canon, Xerox, HP, Sharp, Konica) بناءً على معرف الماك"""
    mac_clean = mac.lower().replace("-", "").replace(":", "")[:6]
    # معرفات تصنيع شائعة
    prefixes = {
        "000085": "Canon", "001e8f": "Canon", "000074": "Ricoh",
        "002673": "Ricoh", "0000aa": "Xerox", "080037": "Xerox",
        "0001e6": "HP", "000e7f": "HP", "001b78": "HP",
        "00019f": "Sharp", "000048": "Konica Minolta"
    }
    return prefixes.get(mac_clean, "ماكينة تصوير شبكية")
