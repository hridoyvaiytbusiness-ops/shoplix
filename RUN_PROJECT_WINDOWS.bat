@echo off
chcp 65001 >nul
title SHOPLIX - E-Commerce Platform Launcher
color 0A
cls
echo ===================================================================
echo             SHOPLIX ই-কমার্স ও ড্রপশিপিং প্ল্যাটফর্ম
echo ===================================================================
echo.
echo [1/3] Node.js যাচাই করা হচ্ছে...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ত্রুটি] আপনার কম্পিউটারে Node.js ইনস্টল করা নেই!
    echo অনুগ্রহ করে https://nodejs.org/ থেকে Node.js ইনস্টল করুন।
    echo.
    echo এরপর পুনরায় এই ফাইলটিতে ডাবল ক্লিক করুন।
    echo ===================================================================
    pause
    exit /b
)

echo [✓] Node.js পাওয়া গেছে!
echo.
echo [2/3] প্রয়োজনীয় প্যাকেজ যাচাই করা হচ্ছে...
if not exist "node_modules\" (
    echo প্যাকেজ ইনস্টল করা হচ্ছে (npm install), অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন...
    call npm install
) else (
    echo [✓] প্যাকেজ ইতিমধ্যে বিদ্যমান।
)

echo.
echo [3/3] ওয়েবসাইট চালু করা হচ্ছে (Port 3000)...
echo.
echo ব্রাউজারে ওয়েবসাইটটি ওপেন হচ্ছে: http://localhost:3000
start http://localhost:3000

call npm run dev
pause
