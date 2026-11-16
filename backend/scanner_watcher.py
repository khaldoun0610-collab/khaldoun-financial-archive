import os
import time
import threading
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from database import get_setting
from batch_processor import batch_manager

class ScannerFileHandler(FileSystemEventHandler):
    def __init__(self, loop, on_new_file_coro):
        super().__init__()
        self.loop = loop
        self.on_new_file_coro = on_new_file_coro
        self.processing_files = set()

    def on_created(self, event):
        if event.is_directory:
            return
        ext = os.path.splitext(event.src_path)[1].lower()
        if ext in ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff']:
            threading.Thread(target=self._wait_and_process, args=(event.src_path,), daemon=True).start()

    def _wait_and_process(self, file_path):
        """الانتظار حتى تنتهي ماكينة التصوير من نقل كامل الملف عبر الشبكة والتأكد من استقرار حجم الملف"""
        if file_path in self.processing_files:
            return
        self.processing_files.add(file_path)

        last_size = -1
        stable_count = 0
        max_retries = 30  # حتى 30 ثانية للملفات الضخمة (1000 ورقة)

        for _ in range(max_retries):
            try:
                if not os.path.exists(file_path):
                    self.processing_files.discard(file_path)
                    return
                current_size = os.path.getsize(file_path)
                if current_size > 0 and current_size == last_size:
                    stable_count += 1
                    if stable_count >= 2:
                        # استقر حجم الملف بالكامل وتم سحبه من ماكينة التصوير
                        break
                else:
                    stable_count = 0
                    last_size = current_size
            except Exception:
                pass
            time.sleep(1)

        # استدعاء معالج الدفعات في حلقة الأحداث غير المتزامنة
        try:
            asyncio.run_coroutine_threadsafe(self.on_new_file_coro(file_path), self.loop)
        except Exception as e:
            print(f"Error dispatching scanner file {file_path}: {e}")
        finally:
            self.processing_files.discard(file_path)

class ScannerWatcherService:
    def __init__(self, loop=None):
        self.loop = loop
        self.observer = None
        self.is_running = False
        self.watch_path = get_setting(
            'hot_folder_path',
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "incoming_scans"))
        )

    def start(self, loop=None):
        if self.is_running:
            return
        if loop:
            self.loop = loop
        os.makedirs(self.watch_path, exist_ok=True)
        event_handler = ScannerFileHandler(self.loop, self._handle_new_scanner_document)
        self.observer = Observer()
        self.observer.schedule(event_handler, path=self.watch_path, recursive=False)
        self.observer.start()
        self.is_running = True
        print(f"[خلدون للأرشيف المالي] مراقب ماكينة التصوير نشط ويراقب المجلد: {self.watch_path}")

    def stop(self):
        if self.observer and self.is_running:
            self.observer.stop()
            self.observer.join()
            self.is_running = False

    async def _handle_new_scanner_document(self, file_path: str):
        print(f"[ماكينة التصوير] تم التقاط ملف وارد: {file_path}")
        try:
            # معالجة الملف وتقسيم أوراقه وتحليل الإمضاءات والعلامات المميزة
            doc_ids = await batch_manager.process_file(file_path)
            print(f"[أرشيف خلدون] تم حفظ وفهرسة {len(doc_ids)} ورقة بنجاح من ماكينة التصوير!")
        except Exception as e:
            print(f"Error in automated scanner pipeline: {e}")

scanner_watcher = ScannerWatcherService()
