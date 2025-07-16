import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const episodeId = params.id;
    const analysisFile = path.join(
      process.cwd(),
      "public",
      "episode",
      `${episodeId}-analysis.yaml`
    );

    if (!fs.existsSync(analysisFile)) {
      return NextResponse.json(
        { error: `Analysis for episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(analysisFile, "utf8");
    const analysisData = yaml.load(fileContent);

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Error loading episode analysis:", error);
    return NextResponse.json(
      { error: "Failed to load episode analysis" },
      { status: 500 }
    );
  }
}
