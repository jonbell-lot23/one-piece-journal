import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET() {
  try {
    const episodesDir = path.join(process.cwd(), "public", "episode");
    const episodeMap = new Map<number, any>();

    // Read all YAML files in the episode directory
    const files = fs.readdirSync(episodesDir);

    for (const file of files) {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        try {
          const filePath = path.join(episodesDir, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const episodeData = yaml.load(fileContent) as any;

          // If this is an analysis file, prioritize it over the basic episode data
          if (file.includes("-analysis")) {
            episodeMap.set(episodeData.episode, episodeData);
          } else if (!episodeMap.has(episodeData.episode)) {
            // Only add basic episode data if we don't have analysis data for this episode
            episodeMap.set(episodeData.episode, episodeData);
          }
        } catch (parseError) {
          console.error(`Error parsing ${file}:`, parseError);
          // Continue with other files
        }
      }
    }

    // Convert map to array and sort by episode number
    const episodes = Array.from(episodeMap.values()).sort(
      (a, b) => a.episode - b.episode
    );

    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Error loading episodes:", error);
    return NextResponse.json(
      { error: "Failed to load episodes" },
      { status: 500 }
    );
  }
}
