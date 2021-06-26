#!/bin/bash
if [ -z "$GIT_REPO" ]
then
      echo "make sure environment variable \$GIT_REPO si defined"
else
      echo "\$GIT_REPO is " $GIT_REPO
fi

if [ -z "$GIT_BRANCH" ]
then
      echo "make sure environment variable \$GIT_BRANCH si defined"
else
      echo "\$GIT_BRANCH is " $GIT_BRANCH
fi

cd /tmp
git clone -b $GIT_BRANCH $GIT_REPO

echo "OK"
