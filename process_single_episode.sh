#!/bin/bash

# Single Episode Processing Script
# This script processes ONE episode and shows the successful results

echo "🎯 One Piece Single Episode Processor"
echo "====================================="

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

# Function to process a single episode
process_single_episode() {
    local episode=$1
    
    echo "📺 Processing Episode $episode..."
    echo "⏳ Running Claude analysis..."
    
    # Create the prompt for Claude
    local prompt="You are a One Piece deep-analysis engine. When given an input in the form:

    ACTION: episode <N>

you will produce:

1. A one-line header:
   ### Episode <N> – \"<Episode Title>\" (air date, if known)

2. A **Synopsis** section of 3–5 bullets, each capturing a high-level narrative beat without specific place or character detail, e.g.:

   **Synopsis:**
   - Still traveling
   - Defeat a boss
   - Meet the queen for the first time
   - Crew faces internal conflict

3. A **Focal Points** line calling out special interest characters, e.g.:

   **Focal Points:** Chef (Sanji), Nico Robin

4. Then identify the episode's 5–7 pivotal beats, and for each output exactly three fields in Markdown:

   **WHAT WAS SAID:**  
   <verbatim dialogue or succinct summary of the key lines>

   **WHY THIS MATTERS:**  
   <1–2 sentences explaining the narrative or character stakes raised>

   **THE SUBTEXT:**  
   <1–2 sentences \"reading between the lines,\" covering character motivation, thematic resonance, or setup for future conflict>

5. Use the following formatting for each beat, with a blank line between beats:

   <beat number>. **<Short Beat Title>**  
   **WHAT WAS SAID**  
   <Dialogue>  
   **WHY THIS MATTERS**  
   <Narrative significance>  
   **THE SUBTEXT**  
   <Deeper meaning>

6. No extra commentary, numbering beyond the beat headers, or filler—just the header, Synopsis, Focal Points, and the formatted WHAT/WHY/SUBTEXT blocks in order of appearance.

Now analyze episode $episode. Provide the analysis in the exact format specified above.

ACTION: episode $episode"

    # Run Claude analysis and save output
    local output_file="episode_${episode}_analysis.txt"
    echo "🤖 Running Claude analysis for episode $episode..."
    
    # Run Claude and capture output
    claude --print --model sonnet "$prompt" > "$output_file" 2>&1
    
    echo ""
    echo "📋 CLAUDE OUTPUT:"
    echo "================="
    cat "$output_file"
    echo "================="
    echo ""
    
    # Check if output is blank or too short
    if [ ! -s "$output_file" ] || [ $(wc -l < "$output_file") -lt 10 ]; then
        echo "❌ Claude output is blank or too short."
        echo "Output file size: $(wc -l < "$output_file") lines"
        return 1
    fi
    
    echo "✅ Claude analysis complete. Output saved to $output_file"
    echo "📊 Analysis contains $(wc -l < "$output_file") lines"
    
    # Create a simple YAML file with the analysis
    local yaml_file="public/episode/${episode}.yaml"
    echo "📝 Creating YAML file: $yaml_file"
    
    cat > "$yaml_file" << EOF
episode: $episode
title: "Episode $episode Analysis"
analysis: |
$(sed 's/^/  /' "$output_file")
processed_at: $(date)
EOF
    
    echo "✅ YAML file created successfully!"
    echo "📁 File location: $yaml_file"
    echo "📏 File size: $(wc -l < "$yaml_file") lines"
    
    return 0
}

# Main execution
echo "📍 Processing Episode $episode_number"
echo ""

if process_single_episode $episode_number; then
    echo "✅ Successfully processed episode $episode_number"
    echo "🎉 DONE!"
else
    echo "❌ Failed to process episode $episode_number"
    exit 1
fi