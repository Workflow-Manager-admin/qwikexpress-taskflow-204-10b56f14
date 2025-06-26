#!/bin/bash
cd /home/kavia/workspace/code-generation/qwikexpress-taskflow-204-10b56f14/express_api_workspace/express_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

