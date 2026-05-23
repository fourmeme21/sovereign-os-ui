#!/bin/bash
VERSION=$1

sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json
npm version $VERSION --no-git-tag-version

git add -A
git commit -m "chore: bump version to v$VERSION"
git tag "v$VERSION"
git push && git push --tags
