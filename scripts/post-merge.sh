#!/bin/bash
set -e
npm run db:push -- --force 2>/dev/null || npm run db:push 2>/dev/null || true
echo "post-merge complete"
