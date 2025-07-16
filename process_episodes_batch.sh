#!/bin/bash

# Batch Episode Processing Script
# This script processes episodes one by one, commits every 5 episodes

echo "🎯 One Piece Batch Episode Processor"
echo "===================================="

# Check if we're in the right directory
if [ ! -d "public/episode" ]; then
    echo "❌ Error: public/episode directory not found. Please run this script from the project root."
    exit 1
fi

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

# Function to process a single episode
process_episode() {
    local episode=$1
    
    echo "📺 Processing Episode $episode..."
    
    # Check if file already exists
    local yaml_file="public/episode/${episode}.yaml"
    if [ -f "$yaml_file" ]; then
        echo "⚠️  Episode $episode already exists, skipping..."
        return 0
    fi
    
    # Run the episode analysis generator
    echo "y" | ./generate_episode_analysis.sh $episode
    
    # Check if the file was created successfully
    if [ -f "$yaml_file" ]; then
        echo "✅ Episode $episode processed successfully"
        return 0
    else
        echo "❌ Failed to create episode $episode"
        return 1
    fi
}

# Function to commit and push a batch
commit_batch() {
    local start_episode=$1
    local end_episode=$2
    
    echo "🚀 Committing episodes $start_episode-$end_episode..."
    
    # Add all yaml files
    git add public/episode/*.yaml
    
    # Commit with a descriptive message
    git commit -m "Add episodes $start_episode-$end_episode analysis

🤖 Generated with Claude Code
    
Co-Authored-By: Claude <noreply@anthropic.com>"
    
    # Push to remote
    echo "📤 Pushing to remote..."
    git push
    
    echo "✅ Batch $start_episode-$end_episode committed and pushed!"
}

# Main processing loop
main() {
    local start_episode=$(find_next_episode)
    local episode_count=0
    local batch_start=$start_episode
    
    if [ $start_episode -gt 1000 ]; then
        echo "🎉 All episodes processed! (up to episode 1000)"
        exit 0
    fi
    
    echo "📍 Starting from Episode $start_episode"
    echo ""
    
    # Process episodes one by one
    while [ $start_episode -le 1000 ]; do
        echo "🔄 Processing Episode $start_episode"
        echo "=================================="
        
        if process_episode $start_episode; then
            episode_count=$((episode_count + 1))
            
            # Check if we've processed 5 episodes
            if [ $episode_count -eq 5 ]; then
                local batch_end=$start_episode
                commit_batch $batch_start $batch_end
                
                # Reset for next batch
                episode_count=0
                batch_start=$((start_episode + 1))
                
                echo "⏸️  Waiting 3 seconds before next batch..."
                sleep 3
            fi
            
            echo "✅ Episode $start_episode complete"
            echo ""
        else
            echo "❌ Failed to process episode $start_episode"
            echo "🛑 Stopping execution. Please fix the issue and run again."
            exit 1
        fi
        
        start_episode=$((start_episode + 1))
        
        # Small delay between episodes
        sleep 1
    done
    
    # Commit any remaining episodes (less than 5)
    if [ $episode_count -gt 0 ]; then
        local batch_end=$((start_episode - 1))
        commit_batch $batch_start $batch_end
    fi
    
    echo "🎊 All episodes processed and committed!"
}

# Check if the episode analysis generator exists
if [ ! -f "./generate_episode_analysis.sh" ]; then
    echo "❌ Error: generate_episode_analysis.sh not found in current directory"
    exit 1
fi

# Make sure the episode analysis generator is executable
chmod +x ./generate_episode_analysis.sh

# Run the main function
main