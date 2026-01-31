#!/usr/bin/env bash
#
# Creates GitHub labels for the UI-Doc repository
# Usage: ./.github/scripts/setup-labels.sh
#
# Requires: gh CLI authenticated with repo access

set -euo pipefail

# Check if gh is available
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "Creating GitHub labels..."

# Scope labels (blue shades)
gh label create "scope:core" --description "Related to @ui-doc/core" --color "0052CC" --force
gh label create "scope:node" --description "Related to @ui-doc/node" --color "0366D6" --force
gh label create "scope:html-renderer" --description "Related to @ui-doc/html-renderer" --color "1D76DB" --force
gh label create "scope:rollup" --description "Related to @ui-doc/rollup" --color "2188FF" --force
gh label create "scope:vite" --description "Related to @ui-doc/vite" --color "58A6FF" --force
gh label create "scope:demos" --description "Related to demo configurations" --color "79B8FF" --force
gh label create "scope:docs" --description "Related to documentation" --color "A2BFFE" --force

# Type labels (varied colors)
gh label create "type:bug" --description "Something isn't working" --color "D73A4A" --force
gh label create "type:feature" --description "New feature request" --color "A2EEEF" --force
gh label create "type:enhancement" --description "Improvement to existing feature" --color "84B6EB" --force
gh label create "type:docs" --description "Documentation changes" --color "0075CA" --force
gh label create "type:testing" --description "Testing improvements" --color "BFD4F2" --force

# Priority labels (red to green gradient)
gh label create "priority:critical" --description "Must be fixed immediately" --color "B60205" --force
gh label create "priority:high" --description "High priority" --color "D93F0B" --force
gh label create "priority:medium" --description "Medium priority" --color "FBCA04" --force
gh label create "priority:low" --description "Low priority" --color "0E8A16" --force

# Workflow labels (green/purple)
gh label create "help-wanted" --description "Extra attention is needed" --color "008672" --force
gh label create "good-first-issue" --description "Good for newcomers" --color "7057FF" --force

echo "Labels created successfully!"
