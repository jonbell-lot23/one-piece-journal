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
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Episode Grid - Left Side */}
        <div className="lg:col-span-1 bg-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            One Piece Episodes
          </h2>
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
        <div className="lg:col-span-2 p-8">
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
