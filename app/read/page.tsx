"use client";

import { useState, useEffect } from "react";

interface Episode {
  id: number;
  title: string;
  description: string;
  content: string;
}

interface EpisodeAnalysis {
  episode: number;
  title: string;
  air_date: string;
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
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeAnalysis, setEpisodeAnalysis] =
    useState<EpisodeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await fetch("/api/episodes");
        if (response.ok) {
          const data = await response.json();
          setEpisodes(data);
          if (data.length > 0) {
            setSelectedEpisode(data[0]);
            // Load analysis for episode 1
            const analysisResponse = await fetch("/api/episode-analysis/1");
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              setEpisodeAnalysis(analysisData);
            }
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

  const handleEpisodeSelect = async (episode: Episode) => {
    setSelectedEpisode(episode);
    try {
      const analysisResponse = await fetch(
        `/api/episode-analysis/${episode.id}`
      );
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setEpisodeAnalysis(analysisData);
      } else {
        setEpisodeAnalysis(null);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setEpisodeAnalysis(null);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          One Piece Episodes
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Episode Grid - Left Side */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Episodes
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedEpisode?.id === episode.id
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Episode {episode.id}
                  </h3>
                  <p className="text-gray-700 text-xs mt-1 line-clamp-2">
                    {episode.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-3">
                    {episode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Episode Content - Right Side */}
          <div className="lg:col-span-2">
            {selectedEpisode && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Episode {selectedEpisode.id}
                  </h2>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {selectedEpisode.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedEpisode.description}
                  </p>
                </div>

                {episodeAnalysis ? (
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        Deep Analysis:
                      </h4>

                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          Synopsis:
                        </h5>
                        <ul className="list-disc list-inside text-gray-700">
                          {episodeAnalysis.synopsis.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          Focal Points:
                        </h5>
                        <p className="text-gray-700">
                          {episodeAnalysis.focal_points}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Pivotal Beats:
                        </h5>
                        {episodeAnalysis.pivotal_beats.map((beat, index) => (
                          <div
                            key={index}
                            className="mb-6 p-3 bg-white rounded border"
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
                                <p className="text-gray-600 mt-1">
                                  {beat.subtext}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        Episode Content:
                      </h4>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedEpisode.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
