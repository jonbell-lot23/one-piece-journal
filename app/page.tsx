"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Masonry from "@/components/masonry";

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

export default function Home() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState<EpisodeAnalysis[]>([]);
  const [viewedEpisodes, setViewedEpisodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load viewed episodes from localStorage
    const savedViewed = localStorage.getItem("viewedEpisodes");
    if (savedViewed) {
      setViewedEpisodes(new Set(JSON.parse(savedViewed)));
    }
  }, []);

  // When landing on the site, automatically open the most recently read episode
  // but avoid redirecting if coming from an episode page or when explicitly
  // disabled via the `noRedirect` query parameter.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("noRedirect") === "1") {
      return;
    }

    if (document.referrer.includes("/read/")) {
      return;
    }

    const savedViewed = localStorage.getItem("viewedEpisodes");
    if (savedViewed) {
      try {
        const viewedArray: number[] = JSON.parse(savedViewed);
        if (viewedArray.length > 0) {
          const latest = Math.max(...viewedArray);
          router.replace(`/read/${latest}?banner=1`);
        }
      } catch (e) {
        console.error("Failed to parse viewed episodes", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await fetch("/api/episodes");
        if (response.ok) {
          const data = await response.json();
          setEpisodes(data);
          // Cache episodes so reading pages can load them offline
          try {
            localStorage.setItem("allEpisodes", JSON.stringify(data));
          } catch (e) {
            console.error("Failed to cache episodes", e);
          }
        } else {
          console.error("Failed to fetch episodes");
        }
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = new Set<number>();

    episodes.forEach((episode) => {
      // Search in title
      if (episode.title.toLowerCase().includes(query)) {
        results.add(episode.episode);
        return;
      }

      // Search in synopsis
      if (
        episode.synopsis.some((point) => point.toLowerCase().includes(query))
      ) {
        results.add(episode.episode);
        return;
      }

      // Search in focal points
      if (episode.focal_points.toLowerCase().includes(query)) {
        results.add(episode.episode);
        return;
      }

      // Search in pivotal beats
      if (episode.pivotal_beats) {
        for (const beat of episode.pivotal_beats) {
          if (
            beat.title.toLowerCase().includes(query) ||
            beat.what_was_said.toLowerCase().includes(query) ||
            beat.why_this_matters.toLowerCase().includes(query) ||
            beat.subtext.toLowerCase().includes(query)
          ) {
            results.add(episode.episode);
            break;
          }
        }
      }
    });

    setSearchResults(results);
  }, [searchQuery, episodes]);

  const handleEpisodeSelect = (episode: EpisodeAnalysis) => {
    // Mark episode as viewed
    const newViewed = new Set(viewedEpisodes);
    newViewed.add(episode.episode);
    setViewedEpisodes(newViewed);

    // Save to localStorage
    localStorage.setItem(
      "viewedEpisodes",
      JSON.stringify(Array.from(newViewed))
    );

    // Navigate to reading page
    router.push(`/read/${episode.episode}`);
  };

  const clearViewedEpisodes = () => {
    setViewedEpisodes(new Set());
    localStorage.removeItem("viewedEpisodes");
    setShowMenu(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
    setSearchResults(new Set());
  };

  const getCurrentEpisodeIndex = () => {
    return episodes.findIndex((ep) => ep.episode === episodes[0]?.episode);
  };

  const getMobileEpisodes = () => {
    if (episodes.length === 0) return [];

    const currentIndex = getCurrentEpisodeIndex();
    const start = Math.max(0, currentIndex - 3);
    const end = Math.min(episodes.length, currentIndex + 4);

    return episodes.slice(start, end);
  };

  const getEpisodeOpacity = (episodeNumber: number) => {
    if (!searchQuery.trim()) return "opacity-100";
    return searchResults.has(episodeNumber) ? "opacity-100" : "opacity-30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading episodes...</div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No episodes found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Navigation Strip */}
      <div className="lg:hidden bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </button>
        </div>

        {/* Mobile Episode Strip */}
        {!showAllEpisodes && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {getMobileEpisodes().map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    flex-shrink-0 w-10 h-10 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium ${getEpisodeOpacity(episode.episode)}
                    ${
                      isViewed
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  title={`Episode ${episode.episode}: ${episode.title}`}
                >
                  {episode.episode}
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Menu */}
        {showMenu && (
          <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-3 z-10 min-w-[180px] flex flex-col gap-1">
            <button
              onClick={() => {
                setShowAllEpisodes(!showAllEpisodes);
                setShowMenu(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              {showAllEpisodes ? "Hide All Episodes" : "Show All Episodes"}
            </button>
            <button
              onClick={() => {
                setShowSearch((prev) => !prev);
                setShowMenu(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              {showSearch ? "Hide Search" : "Search"}
            </button>
            <button
              onClick={clearViewedEpisodes}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Clear Viewed
            </button>
          </div>
        )}

        {/* Mobile Search Input */}
        {showSearch && (
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Mobile Full Episode Grid */}
        {showAllEpisodes && (
          <div className="flex flex-wrap gap-0.5">
            {episodes.map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    w-10 h-10 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium ${getEpisodeOpacity(episode.episode)}
                    ${
                      isViewed
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  title={`Episode ${episode.episode}: ${episode.title}`}
                >
                  {episode.episode}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Episode Grid - Left Side (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 font-['Cochin','Georgia',serif]">
              One Piece Episodes
            </h2>
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center"
                title="Search episodes"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-10">
                    <button
                      onClick={clearViewedEpisodes}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Clear Viewed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Input */}
          {showSearch && (
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Search episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-0.5">
            {episodes.map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    w-12 h-12 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium ${getEpisodeOpacity(episode.episode)}
                    ${
                      isViewed
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  title={`Episode ${episode.episode}: ${episode.title}`}
                >
                  {episode.episode}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area - Now just shows a welcome message */}
        <div className="lg:col-span-3 pt-8 pb-8 px-4 lg:pt-16 lg:pb-8 lg:pl-16 lg:pr-8 font-['Cochin','Georgia',serif]">
          <div className="max-w-none">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              One Piece Episode Journal
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
              Click on any episode number to read the detailed analysis and
              pivotal moments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
