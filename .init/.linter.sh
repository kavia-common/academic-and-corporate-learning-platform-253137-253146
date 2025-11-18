#!/bin/bash
cd /home/kavia/workspace/code-generation/academic-and-corporate-learning-platform-253137-253146/lms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

