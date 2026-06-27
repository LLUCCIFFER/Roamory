"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CloudRain,
  CloudSun,
  MapPinned,
  RefreshCcw,
  Route,
  Snowflake,
  Sparkles,
  Sun,
  Timer,
  TrainFront,
  Waves
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  createQueuedTask,
  GuestDraft,
  makeTaskId,
  saveGenerationTask,
  saveGuestDraft
} from "../../lib/storage";
import type {
  WeekendRecommendation,
  WeekendRecommendationResponse,
  WeekendTravelMode,
  WeatherMood
} from "../../lib/weather-types";

type MoodOption = {
  value: WeatherMood;
  label: string;
  hint: string;
  Icon: LucideIcon;
  interests: string[];
};

const moodOptions: MoodOption[] = [
  {
    value: "sunset",
    label: "晚霞",
    hint: "日照、低降水、日落时间",
    Icon: CloudSun,
    interests: ["晚霞", "拍照", "湖边"]
  },
  {
    value: "sunny",
    label: "晴天",
    hint: "日照时长和低降水",
    Icon: Sun,
    interests: ["拍照", "自然风光", "慢游"]
  },
  {
    value: "seaside",
    label: "海边",
    hint: "海风、温度、降水风险",
    Icon: Waves,
    interests: ["海边", "散步", "咖啡"]
  },
  {
    value: "rainy-town",
    label: "雨后古镇",
    hint: "小雨窗口和低风速",
    Icon: CloudRain,
    interests: ["古镇", "咖啡", "雨后散步"]
  },
  {
    value: "snow",
    label: "雪景",
    hint: "低温、雪码和山地候选",
    Icon: Snowflake,
    interests: ["雪景", "温泉", "慢游"]
  }
];

const radiusOptions = [
  { label: "2 小时内", value: 120 },
  { label: "3 小时内", value: 180 },
  { label: "4 小时内", value: 240 }
];

type RecommendationApiState = {
  data: WeekendRecommendationResponse | null;
  loading: boolean;
  error: string;
};

export default function WeekendPage() {
  const router = useRouter();
  const [departureCity, setDepartureCity] = useState("上海");
  const [mood, setMood] = useState<WeatherMood>("sunset");
  const [travelMode, setTravelMode] = useState<WeekendTravelMode>("public_transport");
  const [maxTravelMinutes, setMaxTravelMinutes] = useState(180);
  const [apiState, setApiState] = useState<RecommendationApiState>({
    data: null,
    loading: true,
    error: ""
  });

  const selectedMood = useMemo(
    () => moodOptions.find((item) => item.value === mood) ?? moodOptions[0],
    [mood]
  );
  const SelectedMoodIcon = selectedMood.Icon;

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRecommendations() {
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch("/api/weather/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureCity,
          mood,
          travelMode,
          maxTravelMinutes
        })
      });
      const payload = (await response.json()) as WeekendRecommendationResponse & { message?: string };
      if (!response.ok) throw new Error(payload.message || "天气推荐暂时不可用。");
      setApiState({ data: payload, loading: false, error: "" });
    } catch (error) {
      setApiState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "天气推荐暂时不可用。"
      });
    }
  }

  function generateOneDayTrip(recommendation: WeekendRecommendation) {
    const taskId = makeTaskId();
    const interests = moodOptions.find((item) => item.value === recommendation.mood)?.interests ?? selectedMood.interests;
    const draft: GuestDraft = {
      taskId,
      destination: recommendation.city,
      departureCity: departureCity.trim() || "上海",
      startDate: recommendation.bestDate,
      days: 1,
      mood: recommendation.moodLabel,
      budget: travelMode === "driving" ? "900" : "600",
      interests,
      companionType: "friends",
      pace: "relaxed",
      transportModes: [travelMode, "walking"],
      mustVisit: recommendation.tags.slice(0, 3).join("、"),
      avoid: recommendation.riskTips.join("；"),
      freeText: `根据 ${recommendation.dateLabel} 的天气窗口生成一日行程。天气依据：${recommendation.weatherEvidence.join("；")}。交通半径：${recommendation.travelLabel}。`,
      savedAt: new Date().toISOString()
    };
    saveGuestDraft(draft);
    saveGenerationTask(createQueuedTask(draft));
    router.push(`/generating?taskId=${taskId}`);
  }

  const recommendations = apiState.data?.recommendations ?? [];

  return (
    <main className="app-shell weekend-page">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span>Weekend Weather</span>
      </header>

      <section className="weekend-hero glass-card">
        <div>
          <p className="eyebrow">Open-Meteo Mood Finder</p>
          <h1>周末天气推荐</h1>
          <p>先用天气窗口筛出适合出发的近郊，再把目的地变成一日行程草稿。</p>
        </div>
        <div className="weather-ribbon" aria-label="当前筛选">
          <span>
            <MapPinned size={15} />
            {departureCity || "上海"} 出发
          </span>
          <span>
            <SelectedMoodIcon size={15} />
            {selectedMood.label}
          </span>
          <span>
            <Timer size={15} />
            {maxTravelMinutes} 分钟内
          </span>
        </div>
      </section>

      <section className="weekend-layout">
        <aside className="weekend-controls glass-card">
          <div className="section-title">
            <div>
              <p>Atmosphere</p>
              <h2>选择天气氛围</h2>
            </div>
            <span>
              <CloudSun size={22} />
            </span>
          </div>

          <label>
            <span>出发城市</span>
            <input
              value={departureCity}
              onChange={(event) => setDepartureCity(event.target.value)}
              placeholder="上海"
            />
          </label>

          <div className="mood-grid" aria-label="氛围选择">
            {moodOptions.map((item) => {
              const MoodIcon = item.Icon;
              return (
                <button
                  key={item.value}
                  className={mood === item.value ? "active" : ""}
                  type="button"
                  onClick={() => setMood(item.value)}
                >
                  <MoodIcon size={18} />
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="weekend-filter-grid">
            <label>
              <span>交通方式</span>
              <select value={travelMode} onChange={(event) => setTravelMode(event.target.value as WeekendTravelMode)}>
                <option value="public_transport">公共交通</option>
                <option value="driving">自驾</option>
              </select>
            </label>
            <label>
              <span>交通半径</span>
              <select
                value={maxTravelMinutes}
                onChange={(event) => setMaxTravelMinutes(Number(event.target.value))}
              >
                {radiusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="primary-action" type="button" onClick={fetchRecommendations} disabled={apiState.loading}>
            {apiState.loading ? <RefreshCcw size={18} /> : <Sparkles size={18} />}
            {apiState.loading ? "正在刷新" : "刷新推荐"}
          </button>

          <p className="weather-source-note">
            天气来自 Open-Meteo forecast；交通时间为当前原型的城市间半径估算，后续可替换为高德城际路线。
          </p>
        </aside>

        <section className="weekend-results" aria-label="周末推荐列表">
          {apiState.error && (
            <article className="weather-warning glass-card">
              <AlertTriangle size={20} />
              <p>{apiState.error}</p>
              <button className="secondary-action" type="button" onClick={fetchRecommendations}>
                <RefreshCcw size={16} />
                重试
              </button>
            </article>
          )}

          {apiState.data?.warning && (
            <article className="weather-warning glass-card">
              <AlertTriangle size={20} />
              <p>{apiState.data.warning}</p>
              <button className="secondary-action" type="button" onClick={fetchRecommendations}>
                <RefreshCcw size={16} />
                重试
              </button>
            </article>
          )}

          {apiState.loading && recommendations.length === 0 ? (
            <article className="recommendation-card glass-card loading-card">
              <RefreshCcw size={28} />
              <h2>正在读取周末天气窗口</h2>
              <p>如果 Open-Meteo 暂时不可用，会自动切到缓存或本地兜底。</p>
            </article>
          ) : (
            recommendations.map((recommendation, index) => (
              <article className="recommendation-card glass-card" key={recommendation.id}>
                <div className="recommendation-rank">0{index + 1}</div>
                <header>
                  <div>
                    <p>{recommendation.region}</p>
                    <h2>{recommendation.city}</h2>
                  </div>
                  <strong>{recommendation.score}</strong>
                </header>

                <div className="recommendation-meta">
                  <span>
                    <CloudSun size={14} />
                    {recommendation.dateLabel}
                  </span>
                  <span>
                    {recommendation.travelMode === "driving" ? <Car size={14} /> : <TrainFront size={14} />}
                    {recommendation.travelLabel}
                  </span>
                  <span>
                    <Route size={14} />
                    {recommendation.source === "open-meteo" ? "实时天气" : recommendation.source === "cache" ? "缓存天气" : "本地兜底"}
                  </span>
                </div>

                <div className="weather-evidence-list">
                  {recommendation.weatherEvidence.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>

                <div className="weather-risk-panel">
                  <AlertTriangle size={17} />
                  <div>
                    {recommendation.riskTips.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>

                <div className="recommendation-tags">
                  {recommendation.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <button className="primary-action" type="button" onClick={() => generateOneDayTrip(recommendation)}>
                  <Sparkles size={17} />
                  生成一日行程
                </button>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
