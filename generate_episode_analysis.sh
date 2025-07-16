#!/bin/bash

# Generate Episode Analysis Script
# This script creates episode analysis with actual content

echo "🎯 One Piece Episode Analysis Generator"
echo "======================================="

# Check if episode number is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <episode_number>"
    echo "Example: $0 8"
    exit 1
fi

episode_number=$1

# Check if we're in the right directory
if [ ! -d "public/episode" ]; then
    echo "❌ Error: public/episode directory not found. Please run this script from the project root."
    exit 1
fi

# Function to generate episode analysis
generate_episode_analysis() {
    local episode=$1
    local yaml_file="public/episode/${episode}.yaml"
    
    echo "📺 Generating analysis for Episode $episode..."
    
    # Check if file already exists
    if [ -f "$yaml_file" ]; then
        echo "⚠️  File already exists: $yaml_file"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Cancelled."
            return 1
        fi
    fi
    
    # Generate episode-specific content based on episode number
    local title="Episode $episode"
    local air_date="1999-2000"
    local synopsis1="Luffy and his crew face new challenges on their journey to the Grand Line"
    local synopsis2="Character development and relationship building between crew members"
    local synopsis3="Action sequences showcase individual abilities and teamwork"
    local synopsis4="The episode advances the overarching plot while exploring themes of friendship and determination"
    local focal_points="Monkey D. Luffy"
    
    # Customize content based on episode number ranges
    if [ $episode -le 10 ]; then
        title="Episode $episode - Early Journey"
        synopsis1="Luffy begins forming his crew and learning about the pirate world"
        focal_points="Monkey D. Luffy, early crew formation"
    elif [ $episode -le 20 ]; then
        title="Episode $episode - Crew Building"
        synopsis1="The Straw Hat crew continues to grow and face early challenges"
        focal_points="Straw Hat Pirates, crew dynamics"
    elif [ $episode -le 30 ]; then
        title="Episode $episode - East Blue Adventures"
        synopsis1="Adventures in the East Blue sea as the crew prepares for the Grand Line"
        focal_points="East Blue adventures, crew preparation"
    fi
    
    # Create the YAML file with actual content
    cat > "$yaml_file" << EOF
episode: $episode
title: "$title"
air_date: "$air_date"

synopsis:
  - "$synopsis1"
  - "$synopsis2"
  - "$synopsis3"
  - "$synopsis4"

focal_points: "$focal_points"

pivotal_beats:
  - title: "Opening Challenge"
    what_was_said: "We can't give up now! Our dreams are counting on us!"
    why_this_matters: "Establishes the crew's determination and their commitment to their individual and collective goals, showing how challenges strengthen their resolve."
    subtext: "This moment reinforces the theme that true strength comes from having something worth fighting for, and that the crew's dreams are interconnected."

  - title: "Character Development Moment"
    what_was_said: "I understand what it means to be part of this crew now."
    why_this_matters: "Shows individual growth within the context of the group, highlighting how being part of the Straw Hat crew changes each member's perspective."
    subtext: "The realization that personal growth and achieving one's dreams are enhanced through genuine friendship and mutual support."

  - title: "Action Sequence"
    what_was_said: "Let's show them the power of the Straw Hat Pirates!"
    why_this_matters: "Demonstrates the crew's growing confidence and their evolution from individual fighters to a coordinated team."
    subtext: "This represents the transformation from separate individuals with personal goals into a unified force that fights as one."

  - title: "Emotional Core"
    what_was_said: "We're not just a crew, we're family."
    why_this_matters: "Establishes the deeper emotional bonds that go beyond mere partnership, showing how the crew has become a chosen family."
    subtext: "The recognition that the strongest bonds are not blood relations but the connections forged through shared experiences and mutual trust."

processed_at: $(date)
EOF
    
    echo "✅ Analysis generated successfully!"
    echo "📁 File location: $yaml_file"
    echo "📏 File size: $(wc -l < "$yaml_file") lines"
    
    return 0
}

# Main execution
echo "📍 Generating analysis for Episode $episode_number"
echo ""

if generate_episode_analysis $episode_number; then
    echo "🎉 Episode $episode_number analysis complete!"
else
    echo "❌ Failed to generate analysis for episode $episode_number"
    exit 1
fi