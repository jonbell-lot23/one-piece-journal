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
# Function removed - YAML files are now created directly in process_episode_batch

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

    # Run Claude analysis and save output
    local output_file="temp_batch_${start_episode}_${end_episode}.txt"
    echo "🤖 Running Claude analysis for episodes $start_episode-$end_episode..."
    
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
        echo "❌ Claude output is blank or too short. Skipping this batch."
        echo "💤 Waiting 10 seconds before trying again..."
        sleep 10
        return 1
    fi
    
    echo "✅ Claude analysis complete. Output saved to $output_file"
    echo "⏳ Waiting 2 seconds for review..."
    sleep 2
    
    # TODO: Add actual YAML extraction logic here
    # For now, the script will continue but won't create proper YAML files
    echo "⚠️  YAML extraction not implemented yet - analysis saved to $output_file"
    
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