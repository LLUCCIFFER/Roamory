"use client";

import {
  CalendarDays,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Compass,
  Download,
  Eye,
  EyeOff,
  Heart,
  ImagePlus,
  LockKeyhole,
  Map,
  MapPinned,
  Plane,
  Plus,
  Route,
  Share2,
  Search,
  Sparkles,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { destinations, mockTrip, recentMemories } from "../lib/mock-data";
import {
  createQueuedTask,
  FootprintCity,
  GuestDraft,
  makeTaskId,
  mockTripId,
  readFootprints,
  readGuestDraft,
  readSavedTrips,
  saveGenerationTask,
  saveGuestDraft,
  toggleFootprintPrivacy,
  lightFootprintCity
} from "../lib/storage";
import type { SavedTrip } from "../lib/storage";

type Tab = "plan" | "weekend" | "footprint" | "mine";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [activeDestination, setActiveDestination] = useState(1);
  const [destinationInput, setDestinationInput] = useState("杭州");
  const [days, setDays] = useState(3);
  const [mood, setMood] = useState("Summer");
  const [budget, setBudget] = useState("2000");
  const [draft, setDraft] = useState<GuestDraft | null>(null);
  const [footprints, setFootprints] = useState<FootprintCity[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [showTrip, setShowTrip] = useState(false);

  const destination = destinations[activeDestination];

  useEffect(() => {
    setDraft(readGuestDraft());
    refreshLocalMemory();
  }, []);

  const plannedStops = useMemo(
    () => mockTrip.days.reduce((count, day) => count + day.stops.length, 0),
    []
  );

  function cycleDestination(direction: -1 | 1) {
    setActiveDestination((current) => {
      const next = current + direction;
      if (next < 0) return destinations.length - 1;
      if (next >= destinations.length) return 0;
      return next;
    });
  }

  function generateDraft() {
    const taskId = makeTaskId();
    const nextDraft: GuestDraft = {
      taskId,
      destination: destinationInput.trim() || destination.city,
      departureCity: "上海",
      startDate: "2026-10-02",
      days,
      mood,
      budget,
      interests: ["拍照", "美食", "慢游", "海边"],
      companionType: "friends",
      pace: "balanced",
      transportModes: ["public_transport", "walking"],
      mustVisit: "",
      avoid: "",
      freeText: "不想太累，希望有一天下午适合慢慢逛。",
      savedAt: new Date().toISOString()
    };
    setDraft(nextDraft);
    saveGuestDraft(nextDraft);
    saveGenerationTask(createQueuedTask(nextDraft));
    router.push(`/generating?taskId=${taskId}`);
  }

  function refreshLocalMemory() {
    setFootprints(readFootprints());
    setSavedTrips(readSavedTrips());
  }

  return (
    <main className="app-shell">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
        <span className="flower flower-two" />
      </div>

      <section className="hero-panel" aria-label="Roamory travel planner">
        <header className="hero-header">
          <p className="eyebrow">Roamory</p>
          <h1>Choose a Destination</h1>
          <CapsuleNav activeTab={activeTab} onChange={setActiveTab} />
        </header>

        {activeTab === "plan" && (
          <div className="plan-grid">
            <section className="carousel-card glass-card" aria-label="目的地轮播">
              <div className="destination-stage">
                <img src={destination.image} alt={`${destination.city} destination preview`} />
                <button
                  className="icon-button carousel-prev"
                  type="button"
                  onClick={() => cycleDestination(-1)}
                  aria-label="上一个目的地"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="icon-button carousel-next"
                  type="button"
                  onClick={() => cycleDestination(1)}
                  aria-label="下一个目的地"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="destination-copy">
                  <span>{destination.region}</span>
                  <strong>{destination.city}</strong>
                </div>
              </div>

              <div className="season-switch" aria-label="氛围选择">
                <button type="button" onClick={() => setMood("Sunset")}>
                  <ChevronLeft size={16} />
                </button>
                <span>{mood}</span>
                <button type="button" onClick={() => setMood("Weekend")}>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="thumbnail-strip">
                {destinations.map((item, index) => (
                  <button
                    key={item.city}
                    className={index === activeDestination ? "thumb active" : "thumb"}
                    type="button"
                    onClick={() => {
                      setActiveDestination(index);
                      setDestinationInput(item.city);
                    }}
                    aria-label={`选择 ${item.city}`}
                  >
                    <img src={item.image} alt="" />
                  </button>
                ))}
              </div>
            </section>

            <section className="planner-card glass-card" aria-label="创建旅行">
              <div className="card-heading">
                <span className="avatar-badge">
                  <Plane size={18} />
                </span>
                <div>
                  <p>Guest mode</p>
                  <h2>My Casual Day Life Diary</h2>
                </div>
              </div>

              <div className="planner-fields">
                <label>
                  <span>目的地</span>
                  <input
                    value={destinationInput}
                    onChange={(event) => setDestinationInput(event.target.value)}
                    placeholder="想去哪里？"
                  />
                </label>
                <div className="field-row">
                  <label>
                    <span>天数</span>
                    <input
                      min={1}
                      max={9}
                      type="number"
                      value={days}
                      onChange={(event) => setDays(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>预算</span>
                    <input
                      inputMode="numeric"
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      placeholder="CNY"
                    />
                  </label>
                </div>
                <div className="chip-row" aria-label="兴趣偏好">
                  {["拍照", "美食", "慢游", "海边"].map((chip) => (
                    <button key={chip} type="button">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <button className="primary-action" type="button" onClick={generateDraft}>
                <Sparkles size={18} />
                生成我的行程
              </button>
              <Link className="secondary-action action-link" href="/create">
                完整填写需求
              </Link>

              <p className="privacy-note">
                <LockKeyhole size={14} />
                游客草稿会先保存在本地。公开链接和跨设备同步时再绑定账号。
              </p>
            </section>
          </div>
        )}

        {activeTab === "weekend" && <WeekendPanel />}
        {activeTab === "footprint" && (
          <FootprintPanel footprints={footprints} savedTrips={savedTrips} onChange={refreshLocalMemory} />
        )}
        {activeTab === "mine" && (
          <MinePanel draft={draft} savedTripCount={savedTrips.length} footprintCount={footprints.length} />
        )}
      </section>

      <div className="lace-divider" aria-hidden="true" />

      <section className="content-band">
        <TravelDiaryCard
          draft={draft}
          plannedStops={plannedStops}
          showTrip={showTrip}
          onShowTrip={() => setShowTrip(true)}
        />

        <aside className="quote-card" aria-label="旅行短句">
          <span className="petal" />
          <p>Slow down, breathe deeply, and collect the little joys.</p>
          <small>Roamory turns plans into memories you can revisit.</small>
        </aside>
      </section>

      {showTrip && <MockTripPreview />}

      <nav className={activeTab === "footprint" ? "bottom-tabs footprint-bottom-tabs" : "bottom-tabs"} aria-label="底部导航">
        <button className={activeTab === "plan" ? "active" : ""} onClick={() => setActiveTab("plan")}>
          <Compass size={18} />
          规划
        </button>
        <button className={activeTab === "weekend" ? "active" : ""} onClick={() => setActiveTab("weekend")}>
          <CloudSun size={18} />
          周末
        </button>
        <button className={activeTab === "footprint" ? "active" : ""} onClick={() => setActiveTab("footprint")}>
          <MapPinned size={18} />
          足迹
        </button>
        <button onClick={() => router.push("/memories")}>
          <ImagePlus size={18} />
          记忆
        </button>
        <button className={activeTab === "mine" ? "active" : ""} onClick={() => setActiveTab("mine")}>
          <UserRound size={18} />
          我的
        </button>
      </nav>
    </main>
  );
}

function CapsuleNav({
  activeTab,
  onChange
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const items: Array<{ label: string; tab: Tab }> = [
    { label: "规划", tab: "plan" },
    { label: "足迹空间", tab: "footprint" },
    { label: "我的日记", tab: "mine" }
  ];

  return (
    <nav className="capsule-nav" aria-label="主导航">
      {items.map((item) => (
        <button
          key={item.tab}
          type="button"
          className={activeTab === item.tab ? "active" : ""}
          onClick={() => onChange(item.tab)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function TravelDiaryCard({
  draft,
  plannedStops,
  showTrip,
  onShowTrip
}: {
  draft: GuestDraft | null;
  plannedStops: number;
  showTrip: boolean;
  onShowTrip: () => void;
}) {
  return (
    <section className="diary-card glass-card">
      <div className="diary-cover">
        <span className="stamp">GOOD PM</span>
        <h2>{draft ? `${draft.destination} ${draft.days} 日旅行日记` : "My Casual Day Life Diary"}</h2>
        <p>
          {draft
            ? `已在游客模式保存本地草稿，预算 CNY ${draft.budget}。`
            : "选择目的地后，Roamory 会把计划沉淀成可以回看的旅行日记。"}
        </p>
      </div>
      <div className="diary-stats">
        <span>
          <CalendarDays size={16} />
          {draft?.days ?? 3} 天
        </span>
        <span>
          <Route size={16} />
          {plannedStops} 个点位
        </span>
        <span>
          <Heart size={16} />
          私密
        </span>
      </div>
      <button className="secondary-action" type="button" onClick={onShowTrip}>
          {showTrip ? "查看下方行程" : "预览行程"}
      </button>
      <Link className="secondary-action action-link" href={`/trips/${mockTripId}`}>
        打开结果页
      </Link>
    </section>
  );
}

function MockTripPreview() {
  return (
    <section className="trip-preview glass-card" aria-label="行程预览">
      <div className="section-title">
        <div>
          <p>Structured TripPlan</p>
          <h2>{mockTrip.title}</h2>
        </div>
        <span>{mockTrip.score} 分</span>
      </div>
      <div className="day-grid">
        {mockTrip.days.map((day) => (
          <article key={day.title} className="day-card">
            <header>
              <span>Day {day.day}</span>
              <strong>{day.title}</strong>
            </header>
            <ol>
              {day.stops.map((stop) => (
                <li key={stop.name}>
                  <span>{stop.time}</span>
                  <div>
                    <strong>{stop.name}</strong>
                    <p>{stop.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <div className="share-row">
        <button type="button">
          <Share2 size={17} />
          生成公开链接
        </button>
        <button type="button">
          <Download size={17} />
          保存海报
        </button>
      </div>
    </section>
  );
}

function WeekendPanel() {
  return (
    <section className="placeholder-panel glass-card">
      <CloudSun size={28} />
      <h2>周末灵感</h2>
      <p>高德天气与交通半径会在后续轮次接入。这里先保留氛围选择入口。</p>
      <div className="chip-row">
        {["晚霞", "海边", "雨后古镇", "露营"].map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function FootprintPanel({
  footprints,
  savedTrips,
  onChange
}: {
  footprints: FootprintCity[];
  savedTrips: SavedTrip[];
  onChange: () => void;
}) {
  const [cityInput, setCityInput] = useState("");
  const [message, setMessage] = useState("");
  const totalVisits = footprints.reduce((count, item) => count + item.visitCount, 0);
  const publicCount = footprints.filter((item) => item.privacy === "public").length;

  function handleLightCity() {
    const footprint = lightFootprintCity({
      city: cityInput,
      source: "manual",
      note: "手动点亮"
    });
    if (!footprint) {
      setMessage("请输入一个城市名。");
      return;
    }
    setCityInput("");
    setMessage(`已点亮 ${footprint.city}。`);
    onChange();
  }

  function handleTogglePrivacy(city: string) {
    const footprint = toggleFootprintPrivacy(city);
    if (!footprint) return;
    setMessage(`${footprint.city} 已设为${footprint.privacy === "public" ? "公开" : "私密"}。`);
    onChange();
  }

  return (
    <section className="footprint-space glass-card" aria-label="足迹空间">
      <div className="section-title">
        <div>
          <p>Virtual Space</p>
          <h2>足迹空间</h2>
        </div>
        <span>{footprints.length || recentMemories.length} cities</span>
      </div>

      <div className="footprint-search">
        <label>
          <Search size={17} />
          <input
            value={cityInput}
            onChange={(event) => setCityInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleLightCity();
            }}
            placeholder="搜索或输入城市，例如 成都"
          />
        </label>
        <button className="primary-action" type="button" onClick={handleLightCity}>
          <MapPinned size={17} />
          点亮城市
        </button>
      </div>

      {message && <p className="inline-success footprint-message">{message}</p>}

      <div className="footprint-overview" aria-label="足迹地图">
        <div className="footprint-map">
          <span className="map-current" />
          <span className="map-current secondary" />
          <Map size={28} />
          <div>
            <strong>{totalVisits || 0}</strong>
            <span>次旅行记忆</span>
          </div>
          <div>
            <strong>{publicCount}</strong>
            <span>个公开城市</span>
          </div>
        </div>
        <div className="footprint-seed-list" aria-label="推荐点亮城市">
          {(footprints.length ? footprints : recentMemories).slice(0, 4).map((memory) => (
            <span key={memory.city}>{memory.city}</span>
          ))}
        </div>
      </div>

      {footprints.length === 0 ? (
        <div className="footprint-empty">
          <BadgeCheck size={22} />
          <p>保存杭州行程后会自动点亮，也可以先手动点亮想记录的城市。</p>
        </div>
      ) : (
        <div className="footprint-card-grid">
          {footprints.map((footprint) => {
            const linkedTrips = savedTrips.filter(
              (trip) =>
                footprint.tripIds.includes(trip.id) ||
                trip.destination.trim().toLocaleLowerCase() === footprint.city.trim().toLocaleLowerCase()
            );
            return (
              <article className="footprint-card" key={footprint.city}>
                <div>
                  <span className="footprint-pin" />
                  <h3>{footprint.city}</h3>
                  <p>{formatFootprintDate(footprint.lastVisitedAt)} 最近点亮</p>
                </div>
                <div className="footprint-card-stats">
                  <span>{footprint.visitCount} 次</span>
                  <span>{linkedTrips.length} 条 Trip</span>
                  <span>{footprint.privacy === "public" ? "公开" : "私密"}</span>
                </div>
                <div className="footprint-card-actions">
                  <Link className="secondary-action action-link" href={`/footprints/${encodeURIComponent(footprint.city)}`}>
                    查看城市
                  </Link>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => handleTogglePrivacy(footprint.city)}
                    title={footprint.privacy === "public" ? "设为私密" : "设为公开"}
                    aria-label={footprint.privacy === "public" ? "设为私密" : "设为公开"}
                  >
                    {footprint.privacy === "public" ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatFootprintDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function MinePanel({
  draft,
  savedTripCount,
  footprintCount
}: {
  draft: GuestDraft | null;
  savedTripCount: number;
  footprintCount: number;
}) {
  return (
    <section className="placeholder-panel glass-card">
      <UserRound size={28} />
      <h2>我的日记</h2>
      <p>{draft ? `本地草稿：${draft.destination} ${draft.days} 日` : "当前是游客模式，还没有本地草稿。"}</p>
      <div className="memory-list">
        <span>{savedTripCount} 条行程</span>
        <span>{footprintCount} 个足迹</span>
      </div>
      <Link className="secondary-action action-link" href="/settings?panel=account&login=1">
        <Plus size={16} />
        绑定账号
      </Link>
      <Link className="secondary-action action-link" href="/memories">
        <ImagePlus size={16} />
        打开相册记忆
      </Link>
    </section>
  );
}
