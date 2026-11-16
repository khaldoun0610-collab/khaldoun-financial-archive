@echo off
chcp 65001 > nul
title خلدون للأرشيف المالي - الخادم الذكي
color 0A

echo =====================================================================
echo                خلدون للأرشيف المالي (Khaldoun Finance Archive)
echo       نظام السحب المباشر من ماكينات التصوير والأرشفة الذكية بالذكاء الاصطناعي
echo =====================================================================
echo.
echo [1/3] فحص بيئة العمل والمجلدات الساخنة...
if not exist "storage\incoming_scans" mkdir "storage\incoming_scans"
if not exist "storage\documents" mkdir "storage\documents"
if not exist "storage\thumbnails" mkdir "storage\thumbnails"
if not exist "storage\batches" mkdir "storage\batches"

echo [2/3] بدء تشغيل خادم خلدون ومراقب ماكينة التصوير (FastAPI + Uvicorn)...
start "" http://127.0.0.1:8000

cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pause
