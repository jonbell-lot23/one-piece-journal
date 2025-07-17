import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const episodeId = params.id;
    const filePath = path.join(
      process.cwd(),
      "public",
      "episode",
      `${episodeId}.yaml`
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Read the file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Extract YAML content from markdown if present
    let yamlContent = fileContent;

    // Check if the content is wrapped in markdown code blocks
    const yamlBlockMatch = fileContent.match(/```yaml\s*([\s\S]*?)\s*```/);
    if (yamlBlockMatch) {
      yamlContent = yamlBlockMatch[1];
    }

    // Parse the YAML content
    const episodeData = yaml.load(yamlContent) as any;

    return NextResponse.json(episodeData);
  } catch (error) {
    console.error("Error reading episode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
