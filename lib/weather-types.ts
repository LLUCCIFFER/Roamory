export type WeatherMood = "sunny" | "sunset" | "seaside" | "rainy-town" | "snow";

export type WeekendTravelMode = "public_transport" | "driving";

export type WeatherRecommendationSource = "open-meteo" | "cache" | "fallback";

export type WeekendRecommendationRequest = {
  departureCity: string;
  mood: WeatherMood;
  maxTravelMinutes: number;
  travelMode: WeekendTravelMode;
};

export type WeekendRecommendation = {
  id: string;
  city: string;
  region: string;
  mood: WeatherMood;
  moodLabel: string;
  bestDate: string;
  dateLabel: string;
  score: number;
  travelMinutes: number;
  travelMode: WeekendTravelMode;
  travelLabel: string;
  weatherEvidence: string[];
  riskTips: string[];
  tags: string[];
  source: WeatherRecommendationSource;
  updatedAt: string;
};

export type WeekendRecommendationResponse = {
  recommendations: WeekendRecommendation[];
  cacheStatus: WeatherRecommendationSource;
  generatedAt: string;
  request: WeekendRecommendationRequest;
  warning?: string;
};
