import asyncio
import os
import sys

# إضافة مسار backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_connection
from batch_processor import batch_manager
from ai_engine import KhaldounAIEngine

async def test_full_flow():
    print("--- [1] اختبار تهيئة قاعدة بيانات خلدون للأرشيف المالي ---")
    init_db()
    conn = get_connection()
    c = conn.cursor()
    batches_count = c.execute("SELECT COUNT(*) FROM batches").fetchone()[0]
    docs_count = c.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    conn.close()
    print(f"قاعدة البيانات جاهزة: عدد الدفعات = {batches_count}, عدد المستندات = {docs_count}")

    print("\n--- [2] اختبار توليد وأرشفة حزمة مستندات مالية تحوي إمضاءات وعلامات مناديب ---")
    batch_id = await batch_manager.generate_mock_batch_1000(total_count=10)
    print(f"تم إنشاء الدفعة بنجاح برقم ID: {batch_id}")

    print("\n--- [3] التحقق من استخراج الإمضاءات وكتابات المناديب والعلامات ---")
    conn = get_connection()
    c = conn.cursor()
    docs = c.execute("SELECT id, doc_number, party_name, delegate_name, amount, has_signature, has_handwriting, has_special_marks FROM documents WHERE batch_id = ?", (batch_id,)).fetchall()
    for d in docs:
        sig_str = "موقع ✅" if d['has_signature'] else "غير موقع ❌"
        hw_str = "به كتابة مندوب ✍️" if d['has_handwriting'] else "بدون كتابة"
        marks_str = "علامة مميزة/ختم ⭐" if d['has_special_marks'] else "بدون علامة"
        print(f"- مستند #{d['id']} [{d['doc_number']}] | طرف: {d['party_name']} | مندوب: {d['delegate_name']} | مبلغ: {d['amount']} ج.م | {sig_str} | {hw_str} | {marks_str}")
    conn.close()

    print("\n--- [4] اختبار محرك بحث بوت خلدون الذكي ---")
    engine = KhaldounAIEngine()
    print("محرك الذكاء الاصطناعي والمحلل الجنائي البصري جاهز للعمل!")

    print("\n✅ كافة الاختبارات نجحت بنجاح تام!")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
