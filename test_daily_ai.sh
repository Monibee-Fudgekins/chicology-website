#!/bin/bash

# Daily AI Test Script
# Usage: ./test_daily_ai.sh [--reset] [--test]

WORKER_URL="https://ai-website-worker.monibee-fudgekin.workers.dev"

# You need to set your DAILY_RUN_KEY as an environment variable
if [ -z "$DAILY_RUN_KEY" ]; then
    echo "Error: DAILY_RUN_KEY environment variable not set"
    echo "Please set it with: export DAILY_RUN_KEY='your-secret-key'"
    exit 1
fi

echo "Daily AI Diagnostics - $(date +%Y-%m-%d)"
echo "=================================================="

# 1. Check debug info and diagnostics
echo -e "\n1. Checking current state..."
curl -s "${WORKER_URL}/__debug" | jq . || echo "Failed to get debug info"

echo -e "\n1b. Checking AI diagnostics..."
curl -s "${WORKER_URL}/__diagnostics" | jq . || echo "Failed to get diagnostics"

# 2. Reset if requested
if [[ "$*" == *"--reset"* ]]; then
    echo -e "\n2. Resetting daily state..."
    curl -s -X POST -H "X-Run-Key: $DAILY_RUN_KEY" "${WORKER_URL}/__reset-daily" | jq . || echo "Reset failed"
fi

# 3. Test daily run
if [[ "$*" == *"--test"* ]]; then
    echo -e "\n3. Testing daily run..."
    echo "Triggering daily run..."
    RESPONSE=$(curl -s -X POST -H "X-Run-Key: $DAILY_RUN_KEY" "${WORKER_URL}/__daily-run")
    echo "Response: $RESPONSE"
    
    echo -e "\nWait 10 seconds for processing..."
    sleep 10
    
    echo -e "\nChecking state after run..."
    curl -s "${WORKER_URL}/__debug" | jq . || echo "Failed to get debug info"
fi

echo -e "\nUsage:"
echo "  ./test_daily_ai.sh              # Check status only"  
echo "  ./test_daily_ai.sh --reset      # Reset daily state"
echo "  ./test_daily_ai.sh --test       # Test daily run"
echo "  ./test_daily_ai.sh --reset --test # Reset and test"
echo -e "\nTo check detailed logs: Go to Cloudflare Dashboard > Workers > Logs"
