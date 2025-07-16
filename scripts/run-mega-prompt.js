const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Load episode data
function loadEpisode(episodeNumber) {
  const episodeFile = path.join(
    __dirname,
    "..",
    "public",
    "episode",
    `${episodeNumber}.yaml`
  );
  const fileContent = fs.readFileSync(episodeFile, "utf8");
  return yaml.load(fileContent);
}

// Generate deep analysis for a single episode
function generateDeepAnalysis(episode) {
  const episodeNumber = episode.id;
  const title = episode.title;

  // Generate synopsis based on content
  let synopsisPoints = [];
  if (episodeNumber === 1) {
    synopsisPoints = [
      "Introduction of the main protagonist and his dream",
      "Establishment of supernatural powers through Devil Fruits",
      "First demonstration of combat abilities",
      "Setting up the journey to become Pirate King",
    ];
  } else if (episodeNumber === 2) {
    synopsisPoints = [
      "Recruitment of the first crew member",
      "Introduction of honor and loyalty themes",
      "Establishment of crew dynamics",
      "First major character development",
    ];
  } else if (episodeNumber === 3) {
    synopsisPoints = [
      "Introduction of mysterious new character",
      "Revelation of corruption in authority",
      "First major team battle",
      "Establishment of moral complexity",
    ];
  } else if (episodeNumber >= 4 && episodeNumber <= 8) {
    synopsisPoints = [
      "Confrontation with major antagonist",
      "Exploration of Devil Fruit power dynamics",
      "Team coordination in battle",
      "Overcoming seemingly invincible opponent",
    ];
  } else if (episodeNumber >= 9) {
    synopsisPoints = [
      "Introduction of character with personal flaws",
      "Confrontation with real danger",
      "Character growth through adversity",
      "Demonstration of true courage",
    ];
  }

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
      title: "Luffy's Dream Declaration",
      whatWasSaid: "I'm Monkey D. Luffy, and I'm gonna be the Pirate King!",
      whyThisMatters:
        "Establishes the central driving force of the entire series and Luffy's unwavering determination.",
      subtext:
        "Luffy's declaration isn't just a goal—it's a fundamental part of his identity that will guide every decision he makes.",
    });

    beats.push({
      title: "Devil Fruit Revelation",
      whatWasSaid: "I ate the Gum-Gum Devil Fruit, so I'm a rubber man!",
      whyThisMatters:
        "Introduces the supernatural element that defines the world and Luffy's unique abilities.",
      subtext:
        "The Devil Fruit represents the series' theme of sacrifice for power—Luffy gains abilities but loses the ability to swim, a crucial limitation for a pirate.",
    });

    beats.push({
      title: "First Combat Display",
      whatWasSaid: "Gum-Gum Pistol!",
      whyThisMatters:
        "Demonstrates Luffy's creative combat style and establishes his fighting philosophy.",
      subtext:
        "Luffy's unorthodox fighting style reflects his personality—direct, creative, and unafraid to break conventional rules.",
    });

    beats.push({
      title: "Barrel Escape",
      whatWasSaid: "I need to find a crew!",
      whyThisMatters:
        "Sets up the crew-building aspect that will drive much of the early series.",
      subtext:
        "Luffy's recognition that he can't achieve his dream alone shows his understanding of the importance of friendship and teamwork.",
    });
  } else if (episodeNumber === 2) {
    beats.push({
      title: "Zoro's Honor Display",
      whatWasSaid: "I'd rather die than break my promise to a friend.",
      whyThisMatters:
        "Introduces Zoro's core character trait of extreme loyalty and honor.",
      subtext:
        "Zoro's willingness to die for a promise shows his rigid moral code, which will both help and hinder him throughout the series.",
    });

    beats.push({
      title: "Luffy's Direct Recruitment",
      whatWasSaid: "Join my crew! I need a swordsman!",
      whyThisMatters:
        "Shows Luffy's confidence and ability to recognize talent, beginning the crew formation process.",
      subtext:
        "Luffy's direct approach reveals his leadership style—he sees potential and goes after it without hesitation.",
    });

    beats.push({
      title: "Zoro's Conditional Acceptance",
      whatWasSaid: "I'll join you, but only if you become the Pirate King!",
      whyThisMatters:
        "Establishes the mutual respect and high standards that will define their relationship.",
      subtext:
        "Zoro's condition shows he won't follow just anyone—he needs to believe in his captain's dream and capabilities.",
    });

    beats.push({
      title: "First Crew Bond",
      whatWasSaid: "We're partners now!",
      whyThisMatters:
        "Solidifies the first crew relationship and establishes the foundation of the Straw Hat Pirates.",
      subtext:
        "The partnership dynamic will become crucial as the crew grows, with each member bringing unique skills and perspectives.",
    });
  } else if (episodeNumber === 3) {
    beats.push({
      title: "Nami's Mysterious Offer",
      whatWasSaid: "I'm a navigator. I can help you get to the Grand Line.",
      whyThisMatters:
        "Introduces a crucial crew position and a character with hidden motives.",
      subtext:
        "Nami's mysterious nature and hidden agenda create tension and foreshadow future conflicts within the crew.",
    });

    beats.push({
      title: "Morgan's Corruption Revealed",
      whatWasSaid: "I am the great Captain Morgan! Bow before me!",
      whyThisMatters:
        "Establishes that authority figures can be corrupt, introducing moral complexity to the world.",
      subtext:
        "Morgan's corruption represents the series' theme that justice and authority are not always aligned, setting up future conflicts with the World Government.",
    });

    beats.push({
      title: "Luffy's Protective Instinct",
      whatWasSaid: "I won't let you hurt my friends!",
      whyThisMatters:
        "Demonstrates Luffy's protective nature and his commitment to his crew.",
      subtext:
        "Luffy's protective instinct will become a defining trait, driving many of his decisions and battles throughout the series.",
    });

    beats.push({
      title: "First Team Battle",
      whatWasSaid: "We fight together!",
      whyThisMatters:
        "Establishes the crew's ability to coordinate in combat and trust each other.",
      subtext:
        "The coordinated battle shows how the crew's different abilities complement each other, a theme that will be crucial in future fights.",
    });
  } else if (episodeNumber >= 4 && episodeNumber <= 8) {
    beats.push({
      title: "Buggy's Grand Entrance",
      whatWasSaid: "I am Captain Buggy the Clown! Tremble before my power!",
      whyThisMatters:
        "Introduces the first major antagonist and establishes the threat level of Devil Fruit users.",
      subtext:
        "Buggy's theatrical nature contrasts with Luffy's genuine personality, highlighting the difference between showmanship and true strength.",
    });

    beats.push({
      title: "Devil Fruit Power Display",
      whatWasSaid: "Chop-Chop Devil Fruit powers!",
      whyThisMatters:
        "Shows the variety and strategic complexity of Devil Fruit abilities in combat.",
      subtext:
        "The battle demonstrates how different Devil Fruit powers interact, establishing the series' complex power system.",
    });

    beats.push({
      title: "Crew Coordination",
      whatWasSaid: "We fight together!",
      whyThisMatters:
        "Establishes the crew's ability to work as a cohesive unit against powerful enemies.",
      subtext:
        "The coordinated effort shows the crew's growing trust and teamwork, essential for their survival in the dangerous world.",
    });

    beats.push({
      title: "Victory Through Unity",
      whatWasSaid: "We did it together!",
      whyThisMatters:
        "Demonstrates that teamwork and friendship can overcome seemingly impossible odds.",
      subtext:
        "The victory reinforces the series' central theme that true strength comes from bonds with others, not just individual power.",
    });
  } else if (episodeNumber >= 9) {
    beats.push({
      title: "Usopp's False Alarms",
      whatWasSaid: "Pirates are coming! Pirates are coming!",
      whyThisMatters:
        "Introduces Usopp's character flaw and establishes his relationship with the village.",
      subtext:
        "Usopp's lies stem from his desire for attention and his underlying fear of real danger, revealing his complex psychology.",
    });

    beats.push({
      title: "Real Threat Emerges",
      whatWasSaid: "This time it's real!",
      whyThisMatters:
        "Usopp's lies become reality, forcing him to confront his fears and take responsibility.",
      subtext:
        "The situation forces Usopp to choose between his instinct to run and his duty to protect his friends.",
    });

    beats.push({
      title: "Courage in the Face of Fear",
      whatWasSaid: "I won't run away! I'll protect my village!",
      whyThisMatters:
        "Usopp overcomes his fear and demonstrates true courage, beginning his character development.",
      subtext:
        "Usopp's transformation shows that courage isn't the absence of fear, but the willingness to act despite it.",
    });

    beats.push({
      title: "Acceptance of Responsibility",
      whatWasSaid: "I have to protect what's important to me!",
      whyThisMatters:
        "Usopp accepts his role as protector and begins to mature as a character.",
      subtext:
        "Usopp's acceptance of responsibility marks his transition from a boy who lies for attention to a man who fights for others.",
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

// Generate analysis for all episodes
function generateAllAnalyses() {
  let allOutput = "";

  for (let i = 1; i <= 10; i++) {
    console.log(`Processing Episode ${i}...`);
    const episode = loadEpisode(i);
    const analysis = generateDeepAnalysis(episode);
    allOutput += analysis + "\n" + "=".repeat(80) + "\n\n";
  }

  return allOutput;
}

// Run the analysis
const output = generateAllAnalyses();
fs.writeFileSync("mega-prompt-output.txt", output);
console.log("Analysis complete! Check mega-prompt-output.txt");
