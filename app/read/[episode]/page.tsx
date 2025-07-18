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
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const loadEpisode = async () => {
      try {
        const episodeNumber = Number(params.episode);

        // Try to load from cached episodes first
        const cached = localStorage.getItem("allEpisodes");
        if (cached) {
          try {
            const allEpisodes: EpisodeAnalysis[] = JSON.parse(cached);
            const cachedEpisode = allEpisodes.find(
              (ep) => ep.episode === episodeNumber
            );
            if (cachedEpisode) {
              setEpisode(cachedEpisode);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached episodes", e);
          }
        }

        // Fallback to API request
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
      loadEpisode();
    }
  }, [params.episode]);

  // Mark current and previous episodes as read
  useEffect(() => {
    if (episode) {
      try {
        const saved = localStorage.getItem("viewedEpisodes");
        const viewed = saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
        for (let i = 1; i <= episode.episode; i++) {
          viewed.add(i);
        }
        localStorage.setItem("viewedEpisodes", JSON.stringify(Array.from(viewed)));
      } catch (e) {
        console.error("Failed to update viewed episodes", e);
      }
    }
  }, [episode]);

  // Show banner when redirected to the most recently read episode
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("banner") === "1") {
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

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
      {showBanner && (
        <div className="relative bg-yellow-100 text-yellow-800 py-2 text-center">
          <span className="font-semibold">Most recently read</span>
          <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-b-8 border-x-transparent border-b-yellow-100" />
        </div>
      )}
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-gray-100 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/?noredirect=1")}
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
            onClick={() => router.push("/?noredirect=1")}
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

      {/* Top Episode Navigation */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-4 py-2 border-b border-gray-200">
        <button
          onClick={() => router.push(`/read/${Number(params.episode) - 1}`)}
          disabled={Number(params.episode) <= 1}
          className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
            Number(params.episode) <= 1 ? "text-gray-300 cursor-not-allowed" : ""
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Prev</span>
        </button>

        <button
          onClick={() => router.push(`/read/${Number(params.episode) + 1}`)}
          className="flex items-center gap-1 hover:text-gray-700 transition-colors text-gray-500"
        >
          <span>Next</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
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
                  className="bg-black text-white px-3 py-1 rounded-full text-sm font-['Inter',sans-serif]"
                >
                  {character}
                </span>
              ))}
            </div>
          </div>

          <div>
            {episode.pivotal_beats && episode.pivotal_beats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episode.pivotal_beats.map((beat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <h6 className="font-semibold text-gray-800 mb-4 text-xl">
                      {index + 1}. {beat.title}
                    </h6>
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-gray-700 text-base">
                          WHAT WAS SAID:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base">
                          {beat.what_was_said}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-base">
                          WHY THIS MATTERS:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base">
                          {beat.why_this_matters}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-base">
                          THE SUBTEXT:
                        </span>
                        <br />
                        <span className="text-gray-600 text-base">
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

          {/* Navigation Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.push(`/read/${episode.episode - 1}`)}
                disabled={episode.episode <= 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  episode.episode <= 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm lg:text-base">
                  Episode {episode.episode - 1}
                </span>
              </button>

              <button
                onClick={() => router.push("/?noredirect=1")}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm lg:text-base">All Episodes</span>
              </button>

              <button
                onClick={() => router.push(`/read/${episode.episode + 1}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm lg:text-base">
                  Episode {episode.episode + 1}
                </span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
