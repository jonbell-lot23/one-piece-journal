#!/bin/bash

# Simple Single Episode Processing Script
# This script creates a template and lets you manually add analysis

echo "🎯 One Piece Single Episode Processor (Simple)"
echo "==============================================="

# Check if episode number is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <episode_number>"
    echo "Example: $0 12"
    exit 1
fi

episode_number=$1

# Check if we're in the right directory
if [ ! -d "public/episode" ]; then
    echo "❌ Error: public/episode directory not found. Please run this script from the project root."
    exit 1
fi

# Check if file already exists
yaml_file="public/episode/${episode_number}.yaml"
if [ -f "$yaml_file" ]; then
    echo "⚠️  File already exists: $yaml_file"
    echo "📄 Current contents:"
    echo "==================="
    cat "$yaml_file"
    echo "==================="
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled."
        exit 1
    fi
fi

echo "📺 Processing Episode $episode_number..."

# Create a template YAML file
echo "📝 Creating YAML template: $yaml_file"

cat > "$yaml_file" << EOF
episode: $episode_number
title: "Episode $episode_number"
air_date: ""
synopsis:
  - ""
  - ""
  - ""
focal_points: ""
pivotal_beats:
  - title: ""
    what_was_said: ""
    why_this_matters: ""
    subtext: ""
  - title: ""
    what_was_said: ""
    why_this_matters: ""
    subtext: ""
  - title: ""
    what_was_said: ""
    why_this_matters: ""
    subtext: ""
processed_at: $(date)
EOF

echo "✅ YAML template created successfully!"
echo "📁 File location: $yaml_file"
echo "📏 File size: $(wc -l < "$yaml_file") lines"

echo ""
echo "📋 Template contents:"
echo "===================="
cat "$yaml_file"
echo "===================="

echo ""
echo "🎉 Template created! You can now:"
echo "1. Edit the file manually: $yaml_file"
echo "2. Or use Claude interactively to fill in the analysis"
echo "3. Or run: claude --print 'Fill in this One Piece episode analysis template: [paste template]'"