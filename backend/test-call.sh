#!/bin/bash

# Test Call Script
# This script helps you test the session manager with a real phone call

echo "🏥 Clinical Campaigns - Test Call Script"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file with your Vapi credentials:"
    echo ""
    echo "VAPI_API_KEY=your_api_key_here"
    echo "VAPI_PHONE_NUMBER_ID=your_phone_number_id"
    echo ""
    echo "You can copy from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Get your credentials from: https://dashboard.vapi.ai/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "📞 Initiating test call to +1 (936) 203-7673"
echo ""
echo "The call will:"
echo "  - Greet the patient by name"
echo "  - Explain the breast cancer screening"
echo "  - Offer to schedule an appointment"
echo ""
echo "Press Ctrl+C to stop monitoring (call will continue)"
echo ""

# Run the test
npm run dev -- examples/test-call.ts
