#!/bin/bash

# Check if episode number is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <episode_number>"
    echo "Example: $0 1"
    exit 1
fi

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY environment variable not set"
    echo "Set it with: export ANTHROPIC_API_KEY='your_api_key_here'"
    exit 1
fi

EPISODE_NUM="$1"
PROMPT_FILE="prompt-1.txt"
OUTPUT_FILE="public/episode/${EPISODE_NUM}.yaml"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: Prompt file '$PROMPT_FILE' not found"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Read the prompt file and create combined search + analysis prompt
PROMPT_CONTENT=$(cat "$PROMPT_FILE")
FULL_PROMPT="First, search the internet for One Piece episode ${EPISODE_NUM} to get the actual episode title, air date, and synopsis details.

Then, using that real episode data, ${PROMPT_CONTENT}

ACTION: episode ${EPISODE_NUM}

IMPORTANT: Your response must be PURE YAML with no text before or after, no markdown code blocks, no explanations. Start directly with the YAML content following this structure:
episode: ${EPISODE_NUM}
title: \"Episode Title\"
air_date: \"Date\"
synopsis:
  - \"Synopsis point 1\"
  - \"Synopsis point 2\"
focal_points: \"Character names\"
pivotal_beats:
  - title: \"Beat Title\"
    what_was_said: \"Dialogue\"
    why_this_matters: \"Explanation\"
    subtext: \"Deeper meaning\"
themes:
  - \"Theme 1\"
  - \"Theme 2\"
character_development:
  - \"Development point 1\"
world_building:
  - \"World building point 1\""

# Escape the prompt for JSON
ESCAPED_PROMPT=$(echo "$FULL_PROMPT" | jq -R -s .)

# Call Anthropic API directly
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "{
        \"model\": \"claude-3-5-sonnet-20241022\",
        \"max_tokens\": 4000,
        \"messages\": [{
            \"role\": \"user\",
            \"content\": $ESCAPED_PROMPT
        }]
    }")

# Check if we got an error
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ API Error for episode $EPISODE_NUM:"
    echo "$RESPONSE" | jq '.error'
    echo "null" > "$OUTPUT_FILE"
    exit 1
fi

# Extract content from JSON response and clean it
CONTENT=$(echo "$RESPONSE" | jq -r '.content[0].text')

# Remove any markdown code blocks and explanatory text
CLEAN_CONTENT=$(echo "$CONTENT" | sed '/^```yaml$/,/^```$/!d' | sed '1d;$d')

# If no yaml blocks found, try to extract starting from "episode:"
if [ -z "$CLEAN_CONTENT" ]; then
    CLEAN_CONTENT=$(echo "$CONTENT" | sed -n '/^episode:/,$p')
fi

# If still empty, use the full content
if [ -z "$CLEAN_CONTENT" ]; then
    CLEAN_CONTENT="$CONTENT"
fi

echo "$CLEAN_CONTENT" > "$OUTPUT_FILE"

# Verify the output isn't null
if [ "$(cat "$OUTPUT_FILE")" = "null" ]; then
    echo "❌ Got null response for episode $EPISODE_NUM. Raw response:"
    echo "$RESPONSE"
    exit 1
fi

# Add small delay to avoid rate limiting
sleep 0.5

echo "Episode ${EPISODE_NUM} analysis saved to $OUTPUT_FILE"