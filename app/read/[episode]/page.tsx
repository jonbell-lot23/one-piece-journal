"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface EpisodeAnalysis {
  episode: number;
  title: string;
  synopsis: string[];
  focal_points: string;
  pivotal_beats: {
    title: string;
    what_was_said: string;
    why_this_matters: string;
    subtext: string;
  }[];
  themes?: string[];
  character_development?: string[];
  world_building?: string[];
}

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<EpisodeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const episodeNumber = params.episode;
        const response = await fetch(`/api/episode-analysis/${episodeNumber}`);

        if (response.ok) {
          const data = await response.json();
          setEpisode(data);
        } else {
          setError("Episode not found");
        }
      } catch (error) {
        console.error("Error fetching episode:", error);
        setError("Failed to load episode");
      } finally {
        setLoading(false);
      }
    };

    if (params.episode) {
      fetchEpisode();
    }
  }, [params.episode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading episode...</div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">
          {error || "Episode not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-gray-100 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 7l-7 7 7 7"
              />
            </svg>
            <span className="text-sm">Back to Episodes</span>
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-gray-100 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 7l-7 7 7 7"
              />
            </svg>
            <span>Back to Episodes</span>
          </button>
        </div>
      </div>

      {/* Episode Content - Kindle-style reading experience */}
      <div className="w-full pt-8 pb-8 px-4 lg:pt-16 lg:pb-8 lg:pl-16 lg:pr-8 font-serif">
        <div className="max-w-none">
          <div className="mb-0">
            <div className="text-sm text-gray-500 mb-1">
              Episode {episode.episode}
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6">
              {episode.title}
            </h1>
          </div>

          <div className="mb-6 mt-4 lg:mt-4 lg:ml-8">
            <ul className="list-disc list-inside text-gray-700 text-base lg:text-lg leading-relaxed space-y-4 lg:space-y-2 mt-0">
              {episode.synopsis.map((point, index) => (
                <li
                  key={index}
                  className={index === 0 ? "mt-0 pt-0" : ""}
                  style={index === 0 ? { marginTop: 0, paddingTop: "0" } : {}}
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 mt-4 lg:mt-4 lg:ml-8">
            <div className="flex flex-wrap gap-2">
              {episode.focal_points.split(", ").map((character, index) => (
                <span
                  key={index}
                  className="font-semibold underline text-base lg:text-sm font-[Inter,sans-serif]"
                >
                  {character}
                </span>
              ))}
            </div>
          </div>

          <div>
            {episode.pivotal_beats && episode.pivotal_beats.length > 0 ? (
              <div className="flex flex-col gap-8">
                {episode.pivotal_beats.map((beat, index) => (
                  <div key={index}>
                    <h6 className="font-semibold text-gray-800 text-lg lg:text-xl">
                      {index + 1}. {beat.title}
                    </h6>
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-gray-700 text-base lg:text-base">
                          WHAT WAS SAID:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base lg:text-lg">
                          {beat.what_was_said}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-base lg:text-base">
                          WHY THIS MATTERS:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base lg:text-lg">
                          {beat.why_this_matters}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-base lg:text-base">
                          THE SUBTEXT:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base lg:text-lg">
                          {beat.subtext}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic text-base lg:text-lg">
                No pivotal beats data available for this episode.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
