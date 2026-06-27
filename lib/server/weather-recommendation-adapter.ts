import "server-only";

import type {
  WeekendRecommendation,
  WeekendRecommendationRequest,
  WeekendRecommendationResponse,
  WeekendTravelMode,
  WeatherMood,
  WeatherRecommendationSource
} from "../weather-types";

type OpenMeteoDailyForecast = {
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    wind_speed_10m_max?: number[];
    sunset?: string[];
    sunshine_duration?: number[];
  };
};

type CityCandidate = {
  id: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  travelMinutes: Record<WeekendTravelMode, number>;
  tags: string[];
  focus: string[];
};

type DailyPoint = {
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbability: number | null;
  precipitationSum: number | null;
  windSpeed: number | null;
  sunset: string | null;
  sunshineHours: number | null;
};

type WeatherCacheEntry = {
  updatedAt: number;
  points: DailyPoint[];
};

const forecastCache = new Map<string, WeatherCacheEntry>();
const cacheTtlMs = 1000 * 60 * 30;

const moodLabels: Record<WeatherMood, string> = {
  sunny: "晴天散步",
  sunset: "晚霞窗口",
  seaside: "海边风",
  "rainy-town": "雨后古镇",
  snow: "雪景"
};

const moodInterests: Record<WeatherMood, string[]> = {
  sunny: ["拍照", "自然风光", "慢游"],
  sunset: ["晚霞", "拍照", "湖边"],
  seaside: ["海边", "散步", "咖啡"],
  "rainy-town": ["古镇", "咖啡", "雨后散步"],
  snow: ["雪景", "温泉", "慢游"]
};

const cityCandidates: CityCandidate[] = [
  {
    id: "hangzhou",
    city: "杭州",
    region: "湖边晚霞",
    latitude: 30.246,
    longitude: 120.21,
    travelMinutes: { public_transport: 120, driving: 155 },
    tags: ["lake", "sunset", "old_town", "tea"],
    focus: ["西湖日落", "运河街区", "茶园慢走"]
  },
  {
    id: "suzhou",
    city: "苏州",
    region: "园林雨声",
    latitude: 31.298,
    longitude: 120.585,
    travelMinutes: { public_transport: 55, driving: 105 },
    tags: ["old_town", "garden", "rainy", "sunny"],
    focus: ["平江路", "园林", "河边咖啡"]
  },
  {
    id: "jiaxing",
    city: "嘉兴",
    region: "水巷短途",
    latitude: 30.746,
    longitude: 120.755,
    travelMinutes: { public_transport: 45, driving: 85 },
    tags: ["old_town", "rainy", "canal"],
    focus: ["月河历史街区", "南湖", "水巷散步"]
  },
  {
    id: "huzhou",
    city: "湖州",
    region: "太湖风",
    latitude: 30.894,
    longitude: 120.087,
    travelMinutes: { public_transport: 105, driving: 130 },
    tags: ["lake", "sunset", "seaside", "quiet"],
    focus: ["太湖边", "月亮湾", "湖畔晚餐"]
  },
  {
    id: "ningbo",
    city: "宁波",
    region: "海风城市",
    latitude: 29.868,
    longitude: 121.544,
    travelMinutes: { public_transport: 125, driving: 180 },
    tags: ["seaside", "sunny", "citywalk"],
    focus: ["老外滩", "海边步道", "港口夜景"]
  },
  {
    id: "shaoxing",
    city: "绍兴",
    region: "雨后老街",
    latitude: 30.0,
    longitude: 120.58,
    travelMinutes: { public_transport: 95, driving: 130 },
    tags: ["old_town", "rainy", "canal"],
    focus: ["仓桥直街", "鲁迅故里", "乌篷船"]
  },
  {
    id: "zhoushan",
    city: "舟山",
    region: "真实海边",
    latitude: 29.985,
    longitude: 122.207,
    travelMinutes: { public_transport: 240, driving: 260 },
    tags: ["seaside", "sunny", "wind"],
    focus: ["海边日落", "岛上散步", "海鲜晚餐"]
  },
  {
    id: "huangshan",
    city: "黄山",
    region: "山间雪候",
    latitude: 29.714,
    longitude: 118.337,
    travelMinutes: { public_transport: 210, driving: 250 },
    tags: ["mountain", "snow", "sunny"],
    focus: ["山间云海", "温泉", "老街"]
  }
];

export async function recommendWeekendTrips(
  input: Partial<WeekendRecommendationRequest>
): Promise<WeekendRecommendationResponse> {
  const request = normalizeRequest(input);
  const filteredCandidates = cityCandidates.filter(
    (candidate) => candidate.travelMinutes[request.travelMode] <= request.maxTravelMinutes
  );
  const candidates = filteredCandidates.length > 0 ? filteredCandidates : cityCandidates.slice(0, 4);
  const generatedAt = new Date().toISOString();

  const evaluated = await Promise.all(candidates.map((candidate) => evaluateCandidate(candidate, request)));
  const recommendations = evaluated
    .sort((a, b) => b.score - a.score || a.travelMinutes - b.travelMinutes)
    .slice(0, 5);
  const cacheStatus = recommendations.some((item) => item.source === "open-meteo")
    ? "open-meteo"
    : recommendations.some((item) => item.source === "cache")
      ? "cache"
      : "fallback";

  return {
    recommendations,
    cacheStatus,
    generatedAt,
    request,
    warning:
      cacheStatus === "fallback"
        ? "天气服务暂时不可用，已用本地候选天气窗口兜底。"
        : cacheStatus === "cache"
          ? "天气服务暂时不可用，已展示最近一次缓存。"
          : undefined
  };
}

export function getMoodInterests(mood: WeatherMood) {
  return moodInterests[mood] ?? moodInterests.sunset;
}

function normalizeRequest(input: Partial<WeekendRecommendationRequest>): WeekendRecommendationRequest {
  const mood = isWeatherMood(input.mood) ? input.mood : "sunset";
  const travelMode = input.travelMode === "driving" ? "driving" : "public_transport";
  const maxTravelMinutes = clampNumber(input.maxTravelMinutes ?? 180, 60, 360);

  return {
    departureCity: input.departureCity?.trim() || "上海",
    mood,
    maxTravelMinutes,
    travelMode
  };
}

async function evaluateCandidate(
  candidate: CityCandidate,
  request: WeekendRecommendationRequest
): Promise<WeekendRecommendation> {
  const { points, source } = await readForecast(candidate);
  const point = selectBestPoint(points, request.mood);
  const travelMinutes = candidate.travelMinutes[request.travelMode];
  const score = scoreCandidate(candidate, point, request);
  const evidence = buildEvidence(candidate, point, request.mood);
  const risks = buildRisks(point, request, travelMinutes, source);

  return {
    id: `${candidate.id}-${request.mood}`,
    city: candidate.city,
    region: candidate.region,
    mood: request.mood,
    moodLabel: moodLabels[request.mood],
    bestDate: point.date,
    dateLabel: formatDate(point.date),
    score,
    travelMinutes,
    travelMode: request.travelMode,
    travelLabel: `${modeLabel(request.travelMode)}约 ${travelMinutes} 分钟`,
    weatherEvidence: evidence,
    riskTips: risks,
    tags: [...new Set([...candidate.focus, ...candidate.tags.slice(0, 2)])].slice(0, 5),
    source,
    updatedAt: new Date().toISOString()
  };
}

async function readForecast(candidate: CityCandidate): Promise<{ points: DailyPoint[]; source: WeatherRecommendationSource }> {
  const cacheKey = `${candidate.latitude},${candidate.longitude}`;
  const cached = forecastCache.get(cacheKey);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(candidate.latitude));
    url.searchParams.set("longitude", String(candidate.longitude));
    url.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max",
        "sunset",
        "sunshine_duration"
      ].join(",")
    );
    url.searchParams.set("timezone", "Asia/Shanghai");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url, { cache: "no-store" });
    const payload = (await response.json()) as OpenMeteoDailyForecast;
    const points = parseDailyForecast(payload);
    if (!response.ok || points.length === 0) throw new Error("Open-Meteo forecast failed.");

    forecastCache.set(cacheKey, { updatedAt: Date.now(), points });
    return { points, source: "open-meteo" };
  } catch {
    if (cached && Date.now() - cached.updatedAt < cacheTtlMs) {
      return { points: cached.points, source: "cache" };
    }
    return { points: createFallbackForecast(), source: "fallback" };
  }
}

function parseDailyForecast(payload: OpenMeteoDailyForecast): DailyPoint[] {
  const time = payload.daily?.time ?? [];
  return time.map((date, index) => ({
    date,
    weatherCode: readNumber(payload.daily?.weather_code?.[index]),
    temperatureMax: readNumber(payload.daily?.temperature_2m_max?.[index]),
    temperatureMin: readNumber(payload.daily?.temperature_2m_min?.[index]),
    precipitationProbability: readNumber(payload.daily?.precipitation_probability_max?.[index]),
    precipitationSum: readNumber(payload.daily?.precipitation_sum?.[index]),
    windSpeed: readNumber(payload.daily?.wind_speed_10m_max?.[index]),
    sunset: payload.daily?.sunset?.[index] ?? null,
    sunshineHours: secondsToHours(payload.daily?.sunshine_duration?.[index])
  }));
}

function createFallbackForecast(): DailyPoint[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      weatherCode: index % 3 === 1 ? 3 : 1,
      temperatureMax: 27,
      temperatureMin: 21,
      precipitationProbability: index % 3 === 2 ? 48 : 24,
      precipitationSum: index % 3 === 2 ? 1.8 : 0,
      windSpeed: 18,
      sunset: `${date.toISOString().slice(0, 10)}T18:52`,
      sunshineHours: index % 3 === 2 ? 2.8 : 5.5
    };
  });
}

function selectBestPoint(points: DailyPoint[], mood: WeatherMood) {
  const weekend = points.filter((point) => {
    const day = new Date(`${point.date}T12:00:00`).getDay();
    return day === 0 || day === 6;
  });
  const pool = weekend.length ? weekend : points;
  return pool.sort((a, b) => scoreWeatherPoint(b, mood) - scoreWeatherPoint(a, mood))[0] ?? createFallbackForecast()[0];
}

function scoreCandidate(candidate: CityCandidate, point: DailyPoint, request: WeekendRecommendationRequest) {
  const weatherScore = scoreWeatherPoint(point, request.mood);
  const tagScore = moodTagScore(candidate.tags, request.mood);
  const distancePenalty = Math.max(0, (candidate.travelMinutes[request.travelMode] / request.maxTravelMinutes) * 18);
  return clampNumber(Math.round(weatherScore + tagScore - distancePenalty), 40, 98);
}

function scoreWeatherPoint(point: DailyPoint, mood: WeatherMood) {
  const precipitation = point.precipitationProbability ?? 45;
  const wind = point.windSpeed ?? 22;
  const sunshine = point.sunshineHours ?? 3.5;
  const code = point.weatherCode ?? 3;
  const max = point.temperatureMax ?? 24;

  if (mood === "rainy-town") {
    return 62 + closeness(precipitation, 58, 42) * 26 - stormPenalty(code) - Math.max(0, wind - 32) * 0.8;
  }
  if (mood === "snow") {
    const snowCode = code >= 71 && code <= 77 ? 28 : 0;
    return 50 + snowCode + Math.max(0, 8 - max) * 2 - Math.max(0, precipitation - 65) * 0.18;
  }
  if (mood === "seaside") {
    return 60 + lowRainScore(precipitation) * 18 + closeness(wind, 18, 24) * 14 + Math.min(sunshine, 8) * 1.5;
  }
  if (mood === "sunny") {
    return 58 + lowRainScore(precipitation) * 22 + Math.min(sunshine, 8) * 3 - cloudPenalty(code);
  }
  return 58 + lowRainScore(precipitation) * 18 + Math.min(sunshine, 8) * 2.4 - cloudPenalty(code) * 0.8;
}

function moodTagScore(tags: string[], mood: WeatherMood) {
  const table: Record<WeatherMood, string[]> = {
    sunny: ["sunny", "lake", "garden"],
    sunset: ["sunset", "lake", "seaside"],
    seaside: ["seaside", "wind"],
    "rainy-town": ["old_town", "rainy", "canal", "garden"],
    snow: ["snow", "mountain"]
  };
  return table[mood].reduce((score, tag) => score + (tags.includes(tag) ? 5 : 0), 0);
}

function buildEvidence(candidate: CityCandidate, point: DailyPoint, mood: WeatherMood) {
  const evidence = [
    `${moodLabels[mood]}匹配：${weatherCodeLabel(point.weatherCode)}`,
    `降水概率 ${formatNumber(point.precipitationProbability, "%")}`,
    `最高 ${formatNumber(point.temperatureMax, "°C")}，风速 ${formatNumber(point.windSpeed, "km/h")}`
  ];
  if (point.sunset && (mood === "sunset" || candidate.tags.includes("sunset"))) {
    evidence.push(`日落约 ${point.sunset.slice(11, 16)}`);
  }
  if (point.sunshineHours !== null && mood !== "rainy-town") {
    evidence.push(`日照约 ${point.sunshineHours.toFixed(1)} 小时`);
  }
  return evidence;
}

function buildRisks(
  point: DailyPoint,
  request: WeekendRecommendationRequest,
  travelMinutes: number,
  source: WeatherRecommendationSource
) {
  const risks: string[] = [];
  const precipitation = point.precipitationProbability ?? 0;
  const wind = point.windSpeed ?? 0;
  const code = point.weatherCode ?? 0;

  if (travelMinutes > request.maxTravelMinutes * 0.9) {
    risks.push("接近交通半径上限，建议预留返程缓冲。");
  }
  if (precipitation >= 65) {
    risks.push("降水概率较高，户外拍照需准备雨具和室内备选。");
  }
  if (wind >= 32) {
    risks.push("风速偏高，海边或高处体验可能打折。");
  }
  if (code >= 80) {
    risks.push("可能有阵雨或雷阵雨，出发前需要二次确认。");
  }
  if (source === "cache") {
    risks.push("天气来自缓存，建议点击重试刷新。");
  }
  if (source === "fallback") {
    risks.push("天气服务暂不可用，当前为本地兜底判断。");
  }
  if (risks.length === 0) {
    risks.push("天气窗口较稳，仍建议出发前再看一次临近预报。");
  }
  return risks;
}

function isWeatherMood(value: unknown): value is WeatherMood {
  return value === "sunny" || value === "sunset" || value === "seaside" || value === "rainy-town" || value === "snow";
}

function modeLabel(mode: WeekendTravelMode) {
  return mode === "driving" ? "自驾" : "公共交通";
}

function weatherCodeLabel(code: number | null) {
  if (code === null) return "天气待确认";
  if (code === 0) return "晴";
  if (code <= 3) return "多云";
  if (code <= 48) return "雾或阴天";
  if (code <= 67) return "小雨窗口";
  if (code <= 77) return "雪";
  if (code <= 82) return "阵雨";
  return "强对流风险";
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(parsed);
}

function formatNumber(value: number | null, suffix: string) {
  return value === null ? "待确认" : `${Math.round(value)}${suffix}`;
}

function secondsToHours(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value / 3600;
}

function readNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function lowRainScore(precipitation: number) {
  return clampNumber((100 - precipitation) / 100, 0, 1);
}

function cloudPenalty(code: number) {
  if (code <= 3) return code * 2;
  if (code <= 48) return 8;
  if (code <= 67) return 14;
  return 22;
}

function stormPenalty(code: number) {
  return code >= 80 ? 20 : 0;
}

function closeness(value: number, target: number, range: number) {
  return clampNumber(1 - Math.abs(value - target) / range, 0, 1);
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
