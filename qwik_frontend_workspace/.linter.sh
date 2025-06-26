#!/bin/bash
cd /home/kavia/workspace/code-generation/qwikexpress-taskflow-204-10b56f14/qwik_frontend_workspace/qwik_frontend
npm run lint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

