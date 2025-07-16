import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET() {
  try {
    const episodesDir = path.join(process.cwd(), "public", "episode");
    const killDir = path.join(process.cwd(), "public", "episode", "kill");
    const episodeMap = new Map<number, any>();

    // Read all YAML files in the episode directory
    const files = fs.readdirSync(episodesDir);

    // Check if kill directory exists
    let killFiles: string[] = [];
    try {
      killFiles = fs.readdirSync(killDir);
    } catch (error) {
      console.log("Kill directory not found, skipping analysis files");
    }

    // Process analysis files from the kill subdirectory first (highest priority)
    for (const file of killFiles) {
      if (
        (file.endsWith(".yaml") || file.endsWith(".yml")) &&
        file.includes("-analysis")
      ) {
        try {
          const filePath = path.join(killDir, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const episodeData = yaml.load(fileContent) as any;

          // Only process files that have the expected structure
          if (
            episodeData &&
            typeof episodeData === "object" &&
            episodeData.episode
          ) {
            // Analysis files from kill directory take highest priority
            episodeMap.set(episodeData.episode, episodeData);
          }
        } catch (parseError) {
          console.error(`Error parsing ${file}:`, parseError);
          // Continue with other files
        }
      }
    }

    // Process regular files from the kill subdirectory (medium priority)
    for (const file of killFiles) {
      if (
        (file.endsWith(".yaml") || file.endsWith(".yml")) &&
        !file.includes("-analysis")
      ) {
        try {
          const filePath = path.join(killDir, file);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const episodeData = yaml.load(fileContent) as any;

          // Only process files that have the expected structure
          if (
            episodeData &&
            typeof episodeData === "object" &&
            episodeData.episode
          ) {
            // Only add if we don't have analysis data for this episode
            if (!episodeMap.has(episodeData.episode)) {
              episodeMap.set(episodeData.episode, episodeData);
            }
          }
        } catch (parseError) {
          console.error(`Error parsing ${file}:`, parseError);
          // Continue with other files
        }
      }
    }

    // Process files from the main episode directory last (lowest priority)
    for (const file of files) {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        try {
          const filePath = path.join(episodesDir, file);
          const fileContent = fs.readFileSync(filePath, "utf8");

          // Extract YAML content from markdown code blocks
          let yamlContent = fileContent;
          const yamlBlockMatch = fileContent.match(
            /```yaml\s*\n([\s\S]*?)\n```/
          );
          if (yamlBlockMatch) {
            yamlContent = yamlBlockMatch[1];
          }

          const episodeData = yaml.load(yamlContent) as any;

          // Only process files that have the expected structure
          if (
            episodeData &&
            typeof episodeData === "object" &&
            episodeData.episode
          ) {
            // Only add if we don't have any data for this episode yet
            if (!episodeMap.has(episodeData.episode)) {
              episodeMap.set(episodeData.episode, episodeData);
            }
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
