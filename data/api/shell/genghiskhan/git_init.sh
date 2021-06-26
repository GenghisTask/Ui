#!/bin/bash
rm -rf /app/data/api
mkdir -p /app/data/api
cd /app/data/api
git init
git pull $GIT_REPO $GIT_BRANCH
