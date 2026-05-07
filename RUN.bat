@echo off
REM Start simple HTTP server for Arab Mediators
REM يبدأ خادم HTTP بسيط لموقع وسطاء العرب

echo ╔══════════════════════════════════════════════════════╗
echo ║     وسطاء العرب - منصة الوساطة المحترفة             ║
echo ║     Arab Mediators - Professional Platform           ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo اختر طريقة التشغيل:
echo Choose run method:
echo.
echo 1. استخدم Python (أسهل - Easiest)
echo 2. فتح الملف مباشرة (Direct - قد لا تعمل كل الميزات)
echo.

set /p choice="اختر رقم (Choose number): "

if "%choice%"=="1" (
    echo تحقق من Python...
    python --version >nul 2>&1
    if errorlevel 1 (
        echo Python غير مثبت - يجب تثبيته أولاً
        echo Python not installed - install it first
        pause
        exit /b
    )
    echo.
    echo جاري تشغيل الخادم...
    echo Starting server...
    echo.
    echo افتح المتصفح واذهب إلى:
    echo Open browser and go to:
    echo http://localhost:8000
    echo.
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo فتح الموقع...
    echo Opening website...
    start public\index.html
) else (
    echo اختيار غير صحيح
    echo Invalid choice
    pause
)
