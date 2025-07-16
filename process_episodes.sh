#!/bin/bash

# One Piece Episode Processing Script
# This script processes episodes in batches of 5, checking for existing files first

echo "🎯 One Piece Episode Processor"
echo "=============================="

# Function to find the next episode to process
find_next_episode() {
    local next_episode=1
    
    # Check for existing episode files
    for i in {1..1000}; do
        if [ ! -f "public/episode/$i.yaml" ]; then
            next_episode=$i
            break
        fi
    done
    
    echo $next_episode
}

# Function to extract YAML content from Claude output
extract_yaml_from_output() {
    local output_file=$1
    local start_episode=$2
    local end_episode=$3
    
    echo "🔍 Extracting YAML content from Claude output..."
    
    # Create a temporary file for processing
    local temp_yaml="temp_yaml_extract.txt"
    
    # Extract content between YAML markers or look for YAML-like content
    # First, try to find YAML content after the analysis
    awk '/^---$/,/^---$/' "$output_file" > "$temp_yaml" 2>/dev/null
    
    # If no YAML markers found, try to extract episode blocks
    if [ ! -s "$temp_yaml" ]; then
        # Look for episode blocks and convert them to YAML
        echo "📝 Converting analysis to YAML format..."
        
        # Process each episode in the output
        for episode_num in $(seq $start_episode $end_episode); do
            echo "Processing episode $episode_num..."
            
            # Create YAML file for this episode
            local yaml_file="public/episode/$episode_num.yaml"
            
            # Extract episode content from Claude output
            # This is a simplified approach - you may need to adjust based on actual output format
            awk -v ep="$episode_num" '
            BEGIN { 
                in_episode = 0
                episode_found = 0
            }
            /^### Episode '${episode_num}'/ {
                in_episode = 1
                episode_found = 1
                print "episode: " ep
                next
            }
            in_episode && /^### Episode/ {
                in_episode = 0
                next
            }
            in_episode && /^\*\*Synopsis:\*\*/ {
                print "title: \"Episode '${episode_num}'\""
                print "air_date: \"unknown\""
                print ""
                print "synopsis:"
                next
            }
            in_episode && /^\*\*Focal Points:\*\*/ {
                print "focal_points: \"$(echo $0 | sed \"s/\\*\\*Focal Points:\\*\\* //\")\""
                print ""
                print "pivotal_beats:"
                next
            }
            in_episode && /^[0-9]+\. \*\*/ {
                # Extract beat title
                title = $0
                gsub(/^[0-9]+\. \*\*/, "", title)
                gsub(/\*\*$/, "", title)
                print "  - title: \"" title "\""
                next
            }
            in_episode && /^\*\*WHAT WAS SAID:\*\*/ {
                getline
                gsub(/^[[:space:]]+/, "", $0)
                print "    what_was_said: \"" $0 "\""
                next
            }
            in_episode && /^\*\*WHY THIS MATTERS:\*\*/ {
                getline
                gsub(/^[[:space:]]+/, "", $0)
                print "    why_this_matters: \"" $0 "\""
                next
            }
            in_episode && /^\*\*THE SUBTEXT:\*\*/ {
                getline
                gsub(/^[[:space:]]+/, "", $0)
                print "    subtext: \"" $0 "\""
                print ""
                next
            }
            in_episode && /^[[:space:]]*- / {
                # Synopsis bullet points
                gsub(/^[[:space:]]*- /, "", $0)
                gsub(/^[[:space:]]+/, "", $0)
                print "  - \"" $0 "\""
                next
            }
            ' "$output_file" > "$yaml_file"
            
            if [ -s "$yaml_file" ]; then
                echo "✅ Created $yaml_file"
            else
                echo "❌ Failed to create $yaml_file - output was empty"
                # Create a basic template
                cat > "$yaml_file" << EOF
episode: $episode_num
title: "Episode $episode_num"
air_date: "unknown"

synopsis:
  - "Episode $episode_num analysis"

focal_points: "TBD"

pivotal_beats:
  - title: "TBD"
    what_was_said: "TBD"
    why_this_matters: "TBD"
    subtext: "TBD"
EOF
                echo "📝 Created basic template for $yaml_file"
            fi
        done
        
        # Clean up temp file
        rm -f "$temp_yaml"
    else
        # Process the extracted YAML content
        echo "📝 Processing extracted YAML content..."
        # Split the YAML content into individual episode files
        # This would need to be implemented based on the actual YAML structure
        echo "⚠️  YAML extraction found but manual processing may be needed"
    fi
}

# Function to process episodes in batches
process_episode_batch() {
    local start_episode=$1
    local end_episode=$2
    
    echo "📺 Processing Episodes $start_episode-$end_episode..."
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

Now analyze episodes $start_episode-$end_episode. For each episode, provide the analysis in the exact format specified above. After completing all episodes, output the YAML format for each episode that can be saved as episode files ($start_episode.yaml, $((start_episode+1)).yaml, etc.)."

    # Run Claude and save output
    local output_file="temp_batch_${start_episode}_${end_episode}.txt"
    claude --print --model sonnet "$prompt" > "$output_file"
    
    echo "✅ Claude analysis complete. Output saved to $output_file"
    
    # Automatically extract YAML and create episode files
    extract_yaml_from_output "$output_file" $start_episode $end_episode
    
    # Verify files were created
    local missing_files=0
    for i in $(seq $start_episode $end_episode); do
        if [ ! -f "public/episode/$i.yaml" ]; then
            echo "❌ Missing file: public/episode/$i.yaml"
            missing_files=$((missing_files + 1))
        fi
    done
    
    if [ $missing_files -gt 0 ]; then
        echo "❌ $missing_files files are missing. Please create them before continuing."
        return 1
    fi
    
    echo "✅ All episode files verified!"
    
    # Git operations
    echo "🚀 Committing to git..."
    git add .
    git commit -m "Add episodes $start_episode-$end_episode analysis"
    git push
    
    echo "✅ Batch $start_episode-$end_episode complete!"
    echo ""
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -d "public/episode" ]; then
        echo "❌ Error: public/episode directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Find the next episode to process
    next_episode=$(find_next_episode)
    
    if [ $next_episode -gt 1000 ]; then
        echo "🎉 All episodes processed! (up to episode 1000)"
        exit 0
    fi
    
    echo "📍 Starting from Episode $next_episode"
    echo ""
    
    # Process episodes in batches of 5
    while [ $next_episode -le 1000 ]; do
        end_episode=$((next_episode + 4))
        
        echo "🔄 Processing batch: Episodes $next_episode-$end_episode"
        echo "================================================"
        
        if process_episode_batch $next_episode $end_episode; then
            echo "✅ Successfully processed episodes $next_episode-$end_episode"
            echo "⏸️  Waiting 5 seconds before next batch..."
            sleep 5
        else
            echo "❌ Failed to process episodes $next_episode-$end_episode"
            echo "🛑 Stopping execution. Please fix the issues and run again."
            exit 1
        fi
        
        # Find next episode after this batch
        next_episode=$(find_next_episode)
        
        if [ $next_episode -gt 1000 ]; then
            echo "🎉 All episodes processed! (up to episode 1000)"
            break
        fi
    done
    
    echo "🎊 Episode processing complete!"
}

# Run the main function
main 