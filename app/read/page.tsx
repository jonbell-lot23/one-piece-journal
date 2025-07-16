"use client";

import { useState, useEffect } from "react";

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
}

export default function ReadPage() {
  const [episodes, setEpisodes] = useState<EpisodeAnalysis[]>([]);
  const [selectedEpisode, setSelectedEpisode] =
    useState<EpisodeAnalysis | null>(null);
  const [viewedEpisodes, setViewedEpisodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  useEffect(() => {
    // Load viewed episodes from localStorage
    const savedViewed = localStorage.getItem("viewedEpisodes");
    if (savedViewed) {
      setViewedEpisodes(new Set(JSON.parse(savedViewed)));
    }
  }, []);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await fetch("/api/episodes");
        if (response.ok) {
          const data = await response.json();
          setEpisodes(data);
          if (data.length > 0) {
            setSelectedEpisode(data[0]);
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

  const handleEpisodeSelect = (episode: EpisodeAnalysis) => {
    setSelectedEpisode(episode);

    // Mark episode as viewed
    const newViewed = new Set(viewedEpisodes);
    newViewed.add(episode.episode);
    setViewedEpisodes(newViewed);

    // Save to localStorage
    localStorage.setItem(
      "viewedEpisodes",
      JSON.stringify(Array.from(newViewed))
    );
  };

  const clearViewedEpisodes = () => {
    setViewedEpisodes(new Set());
    localStorage.removeItem("viewedEpisodes");
    setShowMenu(false);
  };

  const getCurrentEpisodeIndex = () => {
    return episodes.findIndex((ep) => ep.episode === selectedEpisode?.episode);
  };

  const getMobileEpisodes = () => {
    if (!selectedEpisode) return [];

    const currentIndex = getCurrentEpisodeIndex();
    const start = Math.max(0, currentIndex - 3);
    const end = Math.min(episodes.length, currentIndex + 4);

    return episodes.slice(start, end);
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Episode {selectedEpisode?.episode || "Loading..."}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAllEpisodes(!showAllEpisodes)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAllEpisodes ? "Hide All" : "Show All"}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Mobile Episode Strip */}
        {!showAllEpisodes && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {getMobileEpisodes().map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);
              const isSelected = selectedEpisode?.episode === episode.episode;

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    flex-shrink-0 w-10 h-10 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isViewed
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
          <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-3 z-10">
            <button
              onClick={clearViewedEpisodes}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Clear Viewed Episodes
            </button>
          </div>
        )}

        {/* Mobile Full Episode Grid */}
        {showAllEpisodes && (
          <div className="flex flex-wrap gap-0.5">
            {episodes.map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);
              const isSelected = selectedEpisode?.episode === episode.episode;

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    w-10 h-10 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isViewed
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

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Episode Grid - Left Side (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              One Piece Episodes
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Menu
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-10">
                  <button
                    onClick={clearViewedEpisodes}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Clear Viewed Episodes
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {episodes.map((episode) => {
              const isViewed = viewedEpisodes.has(episode.episode);
              const isSelected = selectedEpisode?.episode === episode.episode;

              return (
                <div
                  key={episode.episode}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`
                    w-12 h-12 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isViewed
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

        {/* Episode Content - Right Side */}
        <div className="lg:col-span-2 p-4 lg:p-8">
          {selectedEpisode && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Episode {selectedEpisode.episode}
                </h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {selectedEpisode.title}
                </h3>
              </div>

              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 mb-2">Synopsis:</h5>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedEpisode.synopsis.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Focal Points:
                </h5>
                <p className="text-gray-700">{selectedEpisode.focal_points}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-3">
                  Pivotal Beats:
                </h5>
                {selectedEpisode.pivotal_beats.map((beat, index) => (
                  <div
                    key={index}
                    className="mb-6 p-3 bg-gray-50 rounded border"
                  >
                    <h6 className="font-semibold text-gray-800 mb-2">
                      {index + 1}. {beat.title}
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          WHAT WAS SAID:
                        </span>
                        <p className="text-gray-600 mt-1">
                          {beat.what_was_said}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          WHY THIS MATTERS:
                        </span>
                        <p className="text-gray-600 mt-1">
                          {beat.why_this_matters}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          THE SUBTEXT:
                        </span>
                        <p className="text-gray-600 mt-1">{beat.subtext}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
