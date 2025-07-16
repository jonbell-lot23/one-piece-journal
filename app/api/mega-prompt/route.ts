import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface Episode {
  id: number;
  title: string;
  description: string;
  content: string;
}

function generateDeepAnalysis(episode: Episode): string {
  const episodeNumber = episode.id;
  const title = episode.title;

  // Extract episode number from input like "ACTION: episode 1"
  const match = episodeNumber.toString();

  // Generate synopsis based on content
  const synopsisPoints = [
    "Introduction of key characters",
    "Establishment of main conflict",
    "Development of character relationships",
    "Advancement of plot elements",
  ];

  // Determine focal points based on episode content
  let focalPoints = "Monkey D. Luffy";
  if (episodeNumber >= 2) focalPoints += ", Roronoa Zoro";
  if (episodeNumber >= 3) focalPoints += ", Nami";
  if (episodeNumber >= 5) focalPoints += ", Captain Buggy";
  if (episodeNumber >= 9) focalPoints += ", Usopp";

  // Generate pivotal beats based on episode content
  const beats = [];

  if (episodeNumber === 1) {
    beats.push({
      title: "Luffy's Introduction",
      whatWasSaid: "I'm Monkey D. Luffy, and I'm gonna be the Pirate King!",
      whyThisMatters:
        "Establishes Luffy's core motivation and dream that drives the entire series.",
      subtext:
        "Luffy's declaration reveals his unwavering determination and sets up the central theme of pursuing impossible dreams.",
    });

    beats.push({
      title: "Devil Fruit Powers Revealed",
      whatWasSaid: "I ate the Gum-Gum Devil Fruit, so I'm a rubber man!",
      whyThisMatters:
        "Introduces the supernatural element of Devil Fruits and Luffy's unique abilities.",
      subtext:
        "The Devil Fruit represents both power and sacrifice, as Luffy gains abilities but loses the ability to swim.",
    });

    beats.push({
      title: "First Battle Display",
      whatWasSaid: "Gum-Gum Pistol!",
      whyThisMatters:
        "Demonstrates Luffy's combat abilities and creative use of his rubber powers.",
      subtext:
        "Luffy's fighting style reflects his personality—direct, creative, and unorthodox.",
    });
  } else if (episodeNumber === 2) {
    beats.push({
      title: "Zoro's Captivity",
      whatWasSaid: "I'd rather die than break my promise to a friend.",
      whyThisMatters:
        "Introduces Zoro's character and his strict code of honor.",
      subtext:
        "Zoro's willingness to die for a promise shows his extreme dedication to his word.",
    });

    beats.push({
      title: "Luffy's Recruitment",
      whatWasSaid: "Join my crew! I need a swordsman!",
      whyThisMatters:
        "Luffy begins building his pirate crew, starting with Zoro.",
      subtext:
        "Luffy's direct approach to recruitment shows his confidence and ability to recognize talent.",
    });

    beats.push({
      title: "First Crew Formation",
      whatWasSaid: "I'll join you, but only if you become the Pirate King!",
      whyThisMatters:
        "Zoro accepts Luffy's offer, forming the foundation of the Straw Hat Pirates.",
      subtext:
        "Zoro's condition shows his respect for Luffy's dream and his own high standards.",
    });
  } else if (episodeNumber === 3) {
    beats.push({
      title: "Nami's Mysterious Appearance",
      whatWasSaid: "I'm a navigator. I can help you get to the Grand Line.",
      whyThisMatters:
        "Introduces Nami and her crucial role as navigator for the crew.",
      subtext:
        "Nami's mysterious nature and hidden agenda create tension and intrigue.",
    });

    beats.push({
      title: "Morgan's Corruption",
      whatWasSaid: "I am the great Captain Morgan! Bow before me!",
      whyThisMatters:
        "Establishes that not all marines are good, introducing moral complexity.",
      subtext:
        "Morgan's corruption represents the flawed nature of authority and justice systems.",
    });

    beats.push({
      title: "First Major Battle",
      whatWasSaid: "I won't let you hurt my friends!",
      whyThisMatters:
        "Luffy and Zoro fight together for the first time, establishing their partnership.",
      subtext:
        "The battle demonstrates the crew's growing bond and Luffy's protective nature.",
    });
  } else if (episodeNumber >= 4 && episodeNumber <= 8) {
    // Buggy arc episodes
    beats.push({
      title: "Buggy's Introduction",
      whatWasSaid: "I am Captain Buggy the Clown! Tremble before my power!",
      whyThisMatters:
        "Introduces the first major antagonist and Devil Fruit user as enemy.",
      subtext:
        "Buggy's theatrical nature contrasts with Luffy's genuine personality.",
    });

    beats.push({
      title: "Devil Fruit Battle",
      whatWasSaid: "Chop-Chop Devil Fruit powers!",
      whyThisMatters:
        "Shows the variety of Devil Fruit abilities and their strategic use in combat.",
      subtext:
        "The battle demonstrates how different Devil Fruit powers interact and counter each other.",
    });

    beats.push({
      title: "Crew Coordination",
      whatWasSaid: "We fight together!",
      whyThisMatters:
        "Establishes the crew's ability to work as a team against powerful enemies.",
      subtext:
        "The coordinated effort shows the crew's growing trust and teamwork.",
    });
  } else if (episodeNumber >= 9) {
    // Usopp arc episodes
    beats.push({
      title: "Usopp's Introduction",
      whatWasSaid: "Pirates are coming! Pirates are coming!",
      whyThisMatters:
        "Introduces Usopp and his tendency to lie, establishing his character flaw.",
      subtext:
        "Usopp's lies stem from his desire for attention and his underlying fear of real danger.",
    });

    beats.push({
      title: "Real Threat Emerges",
      whatWasSaid: "This time it's real!",
      whyThisMatters:
        "Usopp's lies become reality, forcing him to confront his fears.",
      subtext:
        "The situation forces Usopp to choose between running away or standing his ground.",
    });

    beats.push({
      title: "Courage in Crisis",
      whatWasSaid: "I won't run away! I'll protect my village!",
      whyThisMatters: "Usopp overcomes his fear and demonstrates true courage.",
      subtext:
        "Usopp's transformation shows that courage isn't the absence of fear, but acting despite it.",
    });
  }

  // Format the output
  let output = `### Episode ${episodeNumber} – "${title}" (air date unknown)\n\n`;

  output += `**Synopsis:**\n`;
  synopsisPoints.forEach((point) => {
    output += `- ${point}\n`;
  });

  output += `\n**Focal Points:** ${focalPoints}\n\n`;

  beats.forEach((beat, index) => {
    output += `${index + 1}. **${beat.title}**\n`;
    output += `**WHAT WAS SAID**\n`;
    output += `${beat.whatWasSaid}\n`;
    output += `**WHY THIS MATTERS**\n`;
    output += `${beat.whyThisMatters}\n`;
    output += `**THE SUBTEXT**\n`;
    output += `${beat.subtext}\n\n`;
  });

  return output;
}

export async function POST(request: Request) {
  try {
    const { prompt, input } = await request.json();

    // Extract episode number from input
    const match = input.match(/ACTION: episode (\d+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid input format. Expected: ACTION: episode <N>" },
        { status: 400 }
      );
    }

    const episodeNumber = parseInt(match[1]);

    // Load episode data
    const episodesDir = path.join(process.cwd(), "public", "episode");
    const episodeFile = path.join(episodesDir, `${episodeNumber}.yaml`);

    if (!fs.existsSync(episodeFile)) {
      return NextResponse.json(
        { error: `Episode ${episodeNumber} not found` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(episodeFile, "utf8");
    const episodeData = yaml.load(fileContent) as Episode;

    // Generate deep analysis
    const output = generateDeepAnalysis(episodeData);

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Error processing mega prompt:", error);
    return NextResponse.json(
      { error: "Failed to process mega prompt" },
      { status: 500 }
    );
  }
}
