import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET() {
  try {
    const episodesDir = path.join(process.cwd(), "public", "episode");
    const episodes: any[] = [];

    // Read all YAML files in the episode directory
    const files = fs.readdirSync(episodesDir);

    for (const file of files) {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const filePath = path.join(episodesDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const episodeData = yaml.load(fileContent) as any;
        episodes.push(episodeData);
      }
    }

    // Sort episodes by ID
    episodes.sort((a, b) => a.id - b.id);

    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Error loading episodes:", error);
    return NextResponse.json(
      { error: "Failed to load episodes" },
      { status: 500 }
    );
  }
}
