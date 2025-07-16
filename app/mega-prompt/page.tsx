"use client";

import { useState } from "react";

export default function MegaPromptPage() {
  const [prompt, setPrompt] =
    useState(`You are a One Piece deep-analysis engine. When given an input in the form:

    ACTION: episode <N>

you will produce:

1. A one-line header:
   ### Episode <N> – "<Episode Title>" (air date, if known)

2. A **Synopsis** section of 3–5 bullets, each capturing a high-level narrative beat without specific place or character detail, e.g.:

   **Synopsis:**
   - Still traveling
   - Defeat a boss
   - Meet the queen for the first time
   - Crew faces internal conflict

3. A **Focal Points** line calling out special interest characters, e.g.:

   **Focal Points:** Chef (Sanji), Nico Robin

4. Then identify the episode's 5–7 pivotal beats, and for each output exactly three fields in Markdown:

   **WHAT WAS SAID:**  
   <verbatim dialogue or succinct summary of the key lines>

   **WHY THIS MATTERS:**  
   <1–2 sentences explaining the narrative or character stakes raised>

   **THE SUBTEXT:**  
   <1–2 sentences "reading between the lines," covering character motivation, thematic resonance, or setup for future conflict>

5. Use the following formatting for each beat, with a blank line between beats:

   <beat number>. **<Short Beat Title>**  
   **WHAT WAS SAID**  
   <Dialogue>  
   **WHY THIS MATTERS**  
   <Narrative significance>  
   **THE SUBTEXT**  
   <Deeper meaning>

6. No extra commentary, numbering beyond the beat headers, or filler—just the header, Synopsis, Focal Points, and the formatted WHAT/WHY/SUBTEXT blocks in order of appearance.

Example invocation:

    INPUT: ACTION: episode 130

Expected output structure:

### Episode 130 – "Scent of Danger! The Seventh Member is Nico Robin!" (air date unknown)

**Synopsis:**
- Continuing the voyage
- Unveiling hidden loyalties
- Rescue born from past sacrifice
- Test of trust and value exchange
- Celebration of new bonds
- Reminder of looming threats

**Focal Points:** Chef (Sanji), Nico Robin

1. **Robin's Full Reveal**  
**WHAT WAS SAID**  
"My name is Nico Robin. I am… Miss All Sunday."  
**WHY THIS MATTERS**  
Confirms that the enigmatic Baroque Works agent is officially aboard.  
**THE SUBTEXT**  
By naming herself, she asserts control over her narrative—inviting both acceptance and scrutiny.

... (repeat for each pivotal beat)`);

  const [input, setInput] = useState("ACTION: episode 1");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runMegaPrompt = async () => {
    setIsRunning(true);
    setOutput("Running mega prompt...\n\n");

    try {
      // For now, we'll simulate the analysis based on our episode data
      const response = await fetch("/api/mega-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.output);
      } else {
        setOutput("Error running mega prompt");
      }
    } catch (error) {
      setOutput("Error: " + error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllEpisodes = async () => {
    setIsRunning(true);
    setOutput("Running mega prompt on all episodes...\n\n");

    let allOutput = "";

    for (let i = 1; i <= 10; i++) {
      setOutput((prev) => prev + `Processing Episode ${i}...\n`);

      try {
        const response = await fetch("/api/mega-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            input: `ACTION: episode ${i}`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          allOutput += data.output + "\n\n" + "=".repeat(80) + "\n\n";
          setOutput(allOutput);
        } else {
          allOutput += `Error processing Episode ${i}\n\n`;
          setOutput(allOutput);
        }
      } catch (error) {
        allOutput += `Error processing Episode ${i}: ${error}\n\n`;
        setOutput(allOutput);
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mega Prompt Engine
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Prompt and Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Mega Prompt
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                placeholder="Enter your mega prompt here..."
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Input
              </h2>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., ACTION: episode 1"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={runMegaPrompt}
                disabled={isRunning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? "Running..." : "Run Mega Prompt"}
              </button>

              <button
                onClick={runAllEpisodes}
                disabled={isRunning}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? "Processing..." : "Run All Episodes (1-10)"}
              </button>
            </div>
          </div>

          {/* Right Side - Output */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Output</h2>
            <div className="bg-white border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {output || "Output will appear here..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
