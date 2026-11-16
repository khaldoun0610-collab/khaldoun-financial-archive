import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "storage", "khaldoun_archive.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # جدول الدفعات المسحوبة من ماكينة التصوير (تتسع لأكثر من 1000 ورقة في الدفعة)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_name TEXT NOT NULL,
        source TEXT DEFAULT 'scanner_folder',
        total_pages INTEGER DEFAULT 0,
        processed_pages INTEGER DEFAULT 0,
        physical_box TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        notes TEXT
    )
    ''')

    # جدول المستندات والأوراق المؤرشفة مع تفاصيل الإمضاء وكتابة المندوب
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER,
        doc_number TEXT,
        doc_type TEXT,
        doc_date TEXT,
        amount REAL DEFAULT 0.0,
        currency TEXT DEFAULT 'EGP',
        party_name TEXT,
        delegate_name TEXT,
        has_signature INTEGER DEFAULT 0,
        signature_info TEXT,
        has_handwriting INTEGER DEFAULT 0,
        handwritten_notes TEXT,
        has_special_marks INTEGER DEFAULT 0,
        special_marks TEXT,
        full_text TEXT,
        file_path TEXT NOT NULL,
        thumbnail_path TEXT,
        page_number INTEGER DEFAULT 1,
        confidence_score REAL DEFAULT 0.95,
        ai_analysis_json TEXT,
        created_at TEXT,
        FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE SET NULL
    )
    ''')

    # الفهرس للبحث السريع والفوري في آلاف المستندات
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_batch ON documents(batch_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(doc_type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_delegate ON documents(delegate_name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_signature ON documents(has_signature)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_marks ON documents(has_special_marks)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_party ON documents(party_name)')

    # جدول الإعدادات
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')

    # جدول سيارات التوزيع وأكواد العربيات (Fleet & Vehicles)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_code TEXT UNIQUE NOT NULL,
        plate_number TEXT NOT NULL,
        model TEXT,
        driver_delegate_id INTEGER,
        delegate_name TEXT,
        warehouse_assigned TEXT DEFAULT 'المخزن الرئيسي',
        capacity TEXT,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TEXT
    )
    ''')

    # جدول المناديب والمحصلين (Delegates)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS delegates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        national_id TEXT,
        vehicle_code TEXT,
        route_area TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT
    )
    ''')

    # جدول أصناف مراقبة المخزون (Inventory Items)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_code TEXT UNIQUE NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT,
        unit TEXT DEFAULT 'كرتونة',
        cost_price REAL DEFAULT 0.0,
        selling_price REAL DEFAULT 0.0,
        quantity_warehouse REAL DEFAULT 0.0,
        reorder_level REAL DEFAULT 10.0,
        created_at TEXT
    )
    ''')

    # جدول حركات المخزون (Inventory Transactions - صرف/إضافة/تحميل سيارات)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trans_type TEXT NOT NULL,
        item_id INTEGER,
        item_code TEXT,
        item_name TEXT,
        quantity REAL DEFAULT 0.0,
        unit TEXT DEFAULT 'كرتونة',
        from_location TEXT,
        to_location TEXT,
        vehicle_code TEXT,
        delegate_name TEXT,
        doc_id INTEGER,
        doc_number TEXT,
        notes TEXT,
        created_at TEXT
    )
    ''')

    # جدول إعدادات الربط مع أنظمة ERP (ERP Integration Hub)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS erp_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        erp_name TEXT NOT NULL,
        api_endpoint TEXT,
        api_key TEXT,
        auth_type TEXT DEFAULT 'Bearer',
        company_id TEXT,
        auto_sync INTEGER DEFAULT 1,
        sync_interval TEXT DEFAULT 'hourly',
        status TEXT DEFAULT 'connected',
        last_sync TEXT
    )
    ''')

    # جدول سجل مزامنة ERP (ERP Sync Logs)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS erp_sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_type TEXT NOT NULL,
        direction TEXT DEFAULT 'outgoing',
        records_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'success',
        message TEXT,
        created_at TEXT
    )
    ''')

    # إضافة عمود كود العربية للمستندات والدفعات إن لم يكن موجوداً
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN vehicle_code TEXT DEFAULT 'VH-101'")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE batches ADD COLUMN vehicle_code TEXT DEFAULT 'VH-101'")
    except:
        pass

    # إضافة إعدادات ERP الافتراضية
    cursor.execute("SELECT COUNT(*) FROM erp_configs")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('''
        INSERT INTO erp_configs (erp_name, api_endpoint, api_key, auth_type, company_id, auto_sync, sync_interval, status, last_sync)
        VALUES ('Odoo / SAP / Universal ERP Webhook', 'https://api.company-erp.com/v1/sync', 'ERP_TOKEN_SECURE_9981', 'Bearer', 'COMP_01', 1, 'realtime', 'connected', ?)
        ''', (now_str,))

    # إضافة أصناف مخزون أولية إن لم توجد
    cursor.execute("SELECT COUNT(*) FROM inventory_items")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_items = [
            ("ITM-1001", "أرز أبيض فاخر زهرة الوادي 25 كجم", "مواد غذائية", "شيكارة", 450.0, 520.0, 850.0, 50.0, now_str),
            ("ITM-1002", "زيت طعام عباد الشمس النقي 1 لتر", "زيوت", "كرتونة (12 زجاجة)", 620.0, 710.0, 1200.0, 100.0, now_str),
            ("ITM-1003", "سكر أبيض ناعم كريستال 50 كجم", "مواد غذائية", "شوال", 880.0, 960.0, 600.0, 40.0, now_str),
            ("ITM-1004", "مكرونة الملكة تشكيلة 400 جرام", "جاف", "كرتونة (20 كيس)", 210.0, 245.0, 1500.0, 120.0, now_str),
            ("ITM-1005", "شاي أسود فاخر العروسة 250 جم", "مشروبات", "كرتونة (24 علبة)", 980.0, 1120.0, 450.0, 30.0, now_str),
            ("ITM-1006", "مسحوق غسيل أوتوماتيك أريال 5 كجم", "منظفات", "كرتونة (4 عبوات)", 750.0, 840.0, 380.0, 25.0, now_str)
        ]
        cursor.executemany('''
        INSERT INTO inventory_items (item_code, item_name, category, unit, cost_price, selling_price, quantity_warehouse, reorder_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', initial_items)

    # إضافة أعمدة اسم الماكينة للمستندات والدفعات إن لم تكن موجودة
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN copier_name TEXT DEFAULT 'ماكينة ريكو الرئيسية'")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE batches ADD COLUMN copier_name TEXT DEFAULT 'ماكينة ريكو الرئيسية'")
    except:
        pass

    # إضافة ماكينات شبكة افتراضية أولية متوافقة مع شبكة العمل (192.168.100.x)
    cursor.execute("SELECT COUNT(*) FROM copiers")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        default_copiers = [
            ("ماكينة ريكو الحسابات (Ricoh MP 7502)", "Ricoh", "192.168.100.20", "incoming_scans/ricoh_acc", "مكتب الحسابات - الدور الثاني", 1, 1, "online", now_str),
            ("ماكينة كانون الأرشيف (Canon iR-ADV 6555i)", "Canon", "192.168.100.25", "incoming_scans/canon_arch", "غرفة الأرشيف المالي المركزية", 1, 0, "online", now_str),
            ("ماكينة زيروكس الخزينة (Xerox VersaLink B7035)", "Xerox", "192.168.100.30", "incoming_scans/xerox_treasury", "قسم الخزينة والتحصيل", 1, 0, "online", now_str),
            ("ماكينة شارب الإدارة (Sharp MX-M6071)", "Sharp", "192.168.100.35", "incoming_scans/sharp_mgmt", "مكتب الإدارة المالية", 1, 0, "online", now_str)
        ]
        cursor.executemany('''
        INSERT INTO copiers (name, brand, ip_address, share_folder, location, is_active, is_default, status, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', default_copiers)

    # إضافة سيارات التوزيع وأكواد العربيات الافتراضية
    cursor.execute("SELECT COUNT(*) FROM vehicles")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_vehicles = [
            ("VH-101", "ق ن ر 3145", "شيفروليه دبابة 2024", 1, "محمود عز الدين", "المخزن الرئيسي - 6 أكتوبر", "3 طن / 150 كرتونة", "active", "سيارة توزيع قطاع الجيزة والهرم", now_str),
            ("VH-102", "س ص ع 8921", "جامبو إيسوزو 5 طن", 2, "حسام عبد الغني", "المخزن الرئيسي - 6 أكتوبر", "5 طن / 250 كرتونة", "active", "سيارة توزيع القاهرة الجديدة والشروق", now_str),
            ("VH-103", "د ج ط 4512", "تويوتا هايس فان بضاعة", 3, "طارق فؤاد الزهيري", "مخزن العاشر من رمضان", "2 طن / 100 كرتونة", "active", "سيارة توزيع مدينة نصر ومصر الجديدة", now_str),
            ("VH-104", "ب ر م 6734", "ميتسوبيشي كانتر مبردة", 4, "إيهاب فتحي الشريف", "المخزن الرئيسي - 6 أكتوبر", "4 طن / 200 كرتونة", "active", "سيارة توزيع وسط البلد وشبرا", now_str),
            ("VH-105", "ط ن ك 1289", "سوزوكي فان توزيع سريع", 5, "مصطفى كمال النجار", "مخزن العاشر من رمضان", "1 طن / 60 كرتونة", "active", "سيارة توزيع أكتوبر والشيخ زايد", now_str)
        ]
        cursor.executemany('''
        INSERT INTO vehicles (vehicle_code, plate_number, model, driver_delegate_id, delegate_name, warehouse_assigned, capacity, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', initial_vehicles)

    # إضافة المناديب الجدد وربطهم بأكواد العربيات
    cursor.execute("SELECT COUNT(*) FROM delegates")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_delegates = [
            ("DEL-201", "محمود عز الدين", "01023456781", "29508140102345", "VH-101", "منطقة الجيزة والهرم وفيصل", "active", now_str),
            ("DEL-202", "حسام عبد الغني", "01134567892", "29403150103456", "VH-102", "القاهرة الجديدة والتجمع والشروق", "active", now_str),
            ("DEL-203", "طارق فؤاد الزهيري", "01245678903", "29605200104567", "VH-103", "مدينة نصر ومصر الجديدة وعين شمس", "active", now_str),
            ("DEL-204", "إيهاب فتحي الشريف", "01556789014", "29307110105678", "VH-104", "وسط البلد وشبرا ورمسيس", "active", now_str),
            ("DEL-205", "مصطفى كمال النجار", "01067890125", "29709280106789", "VH-105", "مدينة 6 أكتوبر والشيخ زايد والواحات", "active", now_str)
        ]
        cursor.executemany('''
        INSERT INTO delegates (code, name, phone, national_id, vehicle_code, route_area, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', initial_delegates)

    # ضبط الإعدادات الافتراضية ومفتاح الذكاء الاصطناعي
    default_settings = {
        'system_name': 'خلدون للأرشيف المالي',
        'system_name_en': 'Khaldoun Financial Archive',
        'hot_folder_path': os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "incoming_scans")),
        'auto_ai_indexing': 'true',
        'gemini_api_key': os.getenv('GEMINI_API_KEY', ''),
        'scanner_ip': '192.168.100.20',
        'min_batch_capacity': '1000',
        'box_sequence': '1'
    }

    for k, v in default_settings.items():
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))

    conn.commit()
    conn.close()

def get_setting(key: str, default=None):
    conn = get_connection()
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row['value'] if row else default

def set_setting(key: str, value: str):
    conn = get_connection()
    conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def wipe_and_reset_all_delegates():
    """حذف جميع المناديب القديمة بالكامل وإضافة المناديب الجدد وربطهم بأكواد العربيات"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # تفريغ جدول المناديب القديمة
    cursor.execute("DELETE FROM delegates")
    
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    fresh_delegates = [
        ("DEL-201", "محمود عز الدين", "01023456781", "29508140102345", "VH-101", "منطقة الجيزة والهرم وفيصل", "active", now_str),
        ("DEL-202", "حسام عبد الغني", "01134567892", "29403150103456", "VH-102", "القاهرة الجديدة والتجمع والشروق", "active", now_str),
        ("DEL-203", "طارق فؤاد الزهيري", "01245678903", "29605200104567", "VH-103", "مدينة نصر ومصر الجديدة وعين شمس", "active", now_str),
        ("DEL-204", "إيهاب فتحي الشريف", "01556789014", "29307110105678", "VH-104", "وسط البلد وشبرا ورمسيس", "active", now_str),
        ("DEL-205", "مصطفى كمال النجار", "01067890125", "29709280106789", "VH-105", "مدينة 6 أكتوبر والشيخ زايد والواحات", "active", now_str)
    ]
    cursor.executemany('''
    INSERT INTO delegates (code, name, phone, national_id, vehicle_code, route_area, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', fresh_delegates)
    
    # تحديث وتوزيع الأوراق القديمة على المناديب الجدد وأكواد العربيات
    rows = cursor.execute("SELECT id FROM documents").fetchall()
    v_codes = ["VH-101", "VH-102", "VH-103", "VH-104", "VH-105"]
    d_names = ["محمود عز الدين", "حسام عبد الغني", "طارق فؤاد الزهيري", "إيهاب فتحي الشريف", "مصطفى كمال النجار"]
    
    for idx, r in enumerate(rows):
        assigned_v = v_codes[idx % len(v_codes)]
        assigned_d = d_names[idx % len(d_names)]
        cursor.execute("UPDATE documents SET delegate_name = ?, vehicle_code = ? WHERE id = ?", (assigned_d, assigned_v, r['id']))
        
    conn.commit()
    conn.close()
    return len(fresh_delegates)
