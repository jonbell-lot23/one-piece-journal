#!/bin/bash

# Configuration
MAX_CONCURRENT=1
START_EPISODE=1
END_EPISODE=1136

# Progress tracking
START_TIME=$(date +%s)
TOTAL_EPISODES=1136
PROGRESS_FILE="/tmp/episode_progress_$$"
echo "0" > "$PROGRESS_FILE"

# Function to generate a single episode
generate_episode() {
    local episode_num=$1
    echo "Starting episode $episode_num..."
    ./generate_episode.sh "$episode_num"
    
    # Update progress tracking with simple file counter (no locking needed for single process)
    COMPLETED_COUNT=$(cat "$PROGRESS_FILE" 2>/dev/null || echo "0")
    COMPLETED_COUNT=$((COMPLETED_COUNT + 1))
    echo "$COMPLETED_COUNT" > "$PROGRESS_FILE"
    
    CURRENT_TIME=$(date +%s)
    ELAPSED_MINUTES=$(( (CURRENT_TIME - START_TIME) / 60 ))
    
    if [ $ELAPSED_MINUTES -gt 0 ]; then
        RATE_PER_MINUTE=$(echo "scale=2; $COMPLETED_COUNT / $ELAPSED_MINUTES" | bc)
        REMAINING=$(( TOTAL_EPISODES - COMPLETED_COUNT ))
        ETA_MINUTES=$(echo "scale=0; $REMAINING / $RATE_PER_MINUTE" | bc)
        ETA_TIME=$(date -v+${ETA_MINUTES}M +"%H:%M")
        
        echo "✅ Episode $episode_num completed | Progress: $COMPLETED_COUNT/$TOTAL_EPISODES | Rate: $RATE_PER_MINUTE/min | ETA: $ETA_TIME"
    else
        echo "✅ Episode $episode_num completed | Progress: $COMPLETED_COUNT/$TOTAL_EPISODES"
    fi
}

# Function to wait for available slot
wait_for_slot() {
    while [ $(jobs -r | wc -l) -ge $MAX_CONCURRENT ]; do
        sleep 1
    done
}

# Count existing episodes
EXISTING_COUNT=$(ls public/episode/*.yaml 2>/dev/null | wc -l)
REMAINING_TO_PROCESS=$((TOTAL_EPISODES - EXISTING_COUNT))

# Main processing loop
echo "🚀 Starting batch generation of episodes $START_EPISODE to $END_EPISODE"
echo "📊 Found $EXISTING_COUNT existing episodes, $REMAINING_TO_PROCESS remaining to process"
echo "⚡ Maximum concurrent jobs: $MAX_CONCURRENT"

for episode in $(seq $START_EPISODE $END_EPISODE); do
    # Skip if file already exists
    if [ -f "public/episode/${episode}.yaml" ]; then
        echo "Skipping episode $episode (already exists)"
        continue
    fi
    
    # Wait for an available slot
    wait_for_slot
    
    # Start the episode generation in background
    generate_episode "$episode" &
    
    # Show progress
    echo "Queued episode $episode ($(jobs -r | wc -l) jobs running)"
done

# Wait for all background jobs to complete
echo "Waiting for all jobs to complete..."
wait

# Clean up progress file
rm -f "$PROGRESS_FILE"

echo "All episodes completed!"