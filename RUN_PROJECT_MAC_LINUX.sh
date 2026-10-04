#!/bin/bash
echo "==================================================================="
echo "            SHOPLIX ই-কমার্স ও ড্রপশিপিং প্ল্যাটফর্ম"
echo "==================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ত্রুটি] Node.js পাওয়া যায়নি!"
    echo "অনুগ্রহ করে https://nodejs.org/ থেকে Node.js ইনস্টল করে পুনরায় চেষ্টা করুন।"
    exit 1
fi

echo "[✓] Node.js পাওয়া গেছে!"
echo ""

if [ ! -d "node_modules" ]; then
    echo "প্যাকেজ ইনস্টল করা হচ্ছে (npm install)..."
    npm install
fi

echo ""
echo "ওয়েবসাইট চালু হচ্ছে (Port 3000)..."
echo "আপনার ব্রাউজারে ওপেন করুন: http://localhost:3000"
echo ""

# Try opening browser
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" &
fi

npm run dev
