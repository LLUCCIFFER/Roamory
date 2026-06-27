"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkCheck,
  Camera,
  CheckCircle2,
  Clock3,
  Copy,
  ImagePlus,
  LocateFixed,
  Lock,
  LockKeyhole,
  MapPinned,
  Pencil,
  Palette,
  RefreshCcw,
  Route,
  Save,
  Share2,
  Shuffle,
  Trash2,
  Unlock,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { mockTrip } from "../../../lib/mock-data";
import {
  readAlbumThumbnail,
  readGenerationTask,
  readSavedTrip,
  readUserProfile,
  lightFootprintCity,
  saveAlbumThumbnail,
  saveSavedTrip
} from "../../../lib/storage";
import type { GeoPoint, RouteCalculationResult } from "../../../lib/route-types";
import type { SavedTrip, SavedTripDay, SavedTripStop } from "../../../lib/storage";

type AMapWindow = Window & {
  _AMapSecurityConfig?: {
    securityJsCode: string;
  };
};

type AMapMapInstance = {
  add: (overlays: unknown | unknown[]) => void;
  addControl?: (control: unknown) => void;
  destroy: () => void;
  setFitView?: (overlays?: unknown[], immediately?: boolean, padding?: [number, number, number, number]) => void;
};

type AMapFactory = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMapInstance;
  Marker: new (options: Record<string, unknown>) => unknown;
  Pixel?: new (x: number, y: number) => unknown;
  Polyline: new (options: Record<string, unknown>) => unknown;
  Scale?: new (options?: Record<string, unknown>) => unknown;
  ToolBar?: new (options?: Record<string, unknown>) => unknown;
};

const replacementStops = [
  {
    name: "中国茶叶博物馆",
    tags: ["茶文化", "雨天备选"],
    note: "比户外茶园更稳定，适合作为雨天或低强度替换。",
    duration: "100 分钟",
    transportToNext: "公交/步行 20 分钟"
  },
  {
    name: "南山路夜景",
    tags: ["夜景", "散步"],
    note: "保留湖边氛围，同时减少购物街的人流压力。",
    duration: "90 分钟",
    transportToNext: "步行/打车 18 分钟"
  },
  {
    name: "馒头山社区",
    tags: ["街区", "拍照"],
    note: "轻量城市漫步，适合替换过度热门的点位。",
    duration: "110 分钟",
    transportToNext: "公交/步行 25 分钟"
  }
];

function createEditableTrip(destination = mockTrip.destination): SavedTrip {
  const now = new Date().toISOString();
  return recalculateTrip({
    id: mockTrip.id,
    status: "draft",
    title: `${destination} 旅行日记`,
    destination,
    startDate: mockTrip.startDate,
    budget: mockTrip.budget,
    travelMinutes: mockTrip.travelMinutes,
    score: mockTrip.score,
    summary: mockTrip.summary,
    warnings: mockTrip.warnings,
    days: mockTrip.days.map((day) => ({
      day: day.day,
      title: day.title,
      budget: day.budget,
      travelMinutes: day.travelMinutes,
      stops: day.stops.map((stop, index) => ({
        id: `d${day.day}-s${index + 1}`,
        time: stop.time,
        name: stop.name,
        duration: stop.duration,
        transportToNext: stop.transportToNext,
        tags: stop.tags,
        note: stop.note,
        locked: false,
        replaced: false
      }))
    })),
    revision: 0,
    createdAt: now,
    updatedAt: now
  });
}

function recalculateTrip(trip: SavedTrip): SavedTrip {
  const days = trip.days.map((day) => ({
    ...day,
    travelMinutes: calculateDayTravelMinutes(day)
  }));
  const totalStops = days.reduce((sum, day) => sum + day.stops.length, 0);
  const travelMinutes = days.reduce((sum, day) => sum + day.travelMinutes, 0);
  const score = Math.max(72, Math.min(94, mockTrip.score - Math.max(0, 9 - totalStops) * 2));

  return {
    ...trip,
    days,
    travelMinutes,
    score,
    updatedAt: new Date().toISOString()
  };
}

function calculateDayTravelMinutes(day: SavedTripDay) {
  return day.stops.reduce((sum, stop) => sum + parseMinutes(stop.transportToNext), 0);
}

function parseMinutes(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function createRouteSignature(trip: SavedTrip, dayIndex: number) {
  const day = trip.days[dayIndex] ?? trip.days[0];
  return `${trip.id}:${dayIndex}:${trip.destination}:${day?.stops.map((stop) => `${stop.id}:${stop.name}`).join(">")}`;
}

function applyRouteResult(
  trip: SavedTrip,
  dayIndex: number,
  expectedSignature: string,
  route: RouteCalculationResult
): SavedTrip {
  if (createRouteSignature(trip, dayIndex) !== expectedSignature) return trip;
  const nextTrip: SavedTrip = {
    ...trip,
    days: trip.days.map((day, index) => {
      if (index !== dayIndex) return day;
      return {
        ...day,
        stops: day.stops.map((stop, stopIndex) => {
          const leg = route.legs[stopIndex];
          return leg ? { ...stop, transportToNext: leg.label } : { ...stop, transportToNext: "今日结束" };
        })
      };
    })
  };
  return recalculateTrip(nextTrip);
}

export default function TripResultPage() {
  const [trip, setTrip] = useState<SavedTrip>(() => createEditableTrip());
  const [activeDay, setActiveDay] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [draggedStop, setDraggedStop] = useState<{ dayIndex: number; stopIndex: number } | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const day = trip.days[activeDay] ?? trip.days[0];
  const totalStops = useMemo(
    () => trip.days.reduce((count, item) => count + item.stops.length, 0),
    [trip.days]
  );
  const activeRouteSignature = useMemo(
    () => createRouteSignature(trip, activeDay),
    [activeDay, trip]
  );
  const routeLegByStopId = useMemo(
    () => new Map(routeResult?.legs.map((leg) => [leg.fromStopId, leg]) ?? []),
    [routeResult]
  );

  useEffect(() => {
    setThumbnail(readAlbumThumbnail(mockTrip.id));
    const savedTrip = readSavedTrip(mockTrip.id);
    const task = readGenerationTask();
    if (savedTrip) {
      setTrip(savedTrip);
      return;
    }
    if (task?.draft.destination) {
      setTrip(createEditableTrip(task.draft.destination));
    }
  }, []);

  useEffect(() => {
    if (!day || day.stops.length < 2) return;
    let ignore = false;
    setRouteLoading(true);
    setRouteError("");

    fetch("/api/routes/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        city: trip.destination,
        dayIndex: activeDay,
        stops: day.stops.map((stop) => ({
          id: stop.id,
          name: stop.name,
          city: trip.destination,
          time: stop.time
        }))
      })
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          route?: RouteCalculationResult;
          message?: string;
        };
        if (!response.ok || !payload.route) {
          throw new Error(payload.message || "路线计算失败。");
        }
        return payload.route;
      })
      .then((route) => {
        if (ignore) return;
        setRouteResult(route);
        setTrip((currentTrip) => applyRouteResult(currentTrip, activeDay, activeRouteSignature, route));
      })
      .catch((error) => {
        if (ignore) return;
        setRouteError(error instanceof Error ? error.message : "路线计算失败。");
      })
      .finally(() => {
        if (!ignore) setRouteLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeDay, activeRouteSignature, trip.destination, trip.id]);

  async function generateShareLink() {
    setShareLoading(true);
    setShareError("");
    setCopied(false);

    try {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          privacy: {
            showBudget: true,
            showExactTimes: false,
            showMap: false,
            showThumbnail: Boolean(thumbnail)
          }
        })
      });
      const payload = (await response.json()) as {
        shareLink?: { publicUrl: string };
        message?: string;
      };

      if (!response.ok || !payload.shareLink) {
        throw new Error(payload.message || "公开链接生成失败。");
      }

      setShareUrl(payload.shareLink.publicUrl);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "公开链接生成失败。");
    } finally {
      setShareLoading(false);
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await window.navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
  }

  function uploadThumbnail(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setThumbnail(reader.result);
        saveAlbumThumbnail(trip.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function updateTrip(nextTrip: SavedTrip, message: string) {
    setTrip(recalculateTrip({ ...nextTrip, status: "draft" }));
    setFeedback(message);
    setShareUrl("");
    setCopied(false);
  }

  function updateStop(dayIndex: number, stopIndex: number, updater: (stop: SavedTripStop) => SavedTripStop) {
    const nextTrip: SavedTrip = {
      ...trip,
      days: trip.days.map((item, index) =>
        index === dayIndex
          ? {
              ...item,
              stops: item.stops.map((stop, currentStopIndex) =>
                currentStopIndex === stopIndex ? updater(stop) : stop
              )
            }
          : item
      )
    };
    updateTrip(nextTrip, "路线已更新，记得保存。");
  }

  function toggleStopLock(dayIndex: number, stopIndex: number) {
    updateStop(dayIndex, stopIndex, (stop) => ({
      ...stop,
      locked: !stop.locked
    }));
  }

  function replaceStop(dayIndex: number, stopIndex: number) {
    const currentStop = trip.days[dayIndex]?.stops[stopIndex];
    if (!currentStop || currentStop.locked) return;
    const replacement = replacementStops[(trip.revision + dayIndex + stopIndex) % replacementStops.length];

    updateStop(dayIndex, stopIndex, (stop) => ({
      ...stop,
      name: replacement.name,
      duration: replacement.duration,
      transportToNext: replacement.transportToNext,
      tags: replacement.tags,
      note: replacement.note,
      replaced: true,
      originalName: stop.originalName ?? stop.name
    }));
  }

  function removeStop(dayIndex: number, stopIndex: number) {
    const currentDay = trip.days[dayIndex];
    const currentStop = currentDay?.stops[stopIndex];
    if (!currentDay || !currentStop || currentStop.locked || currentDay.stops.length <= 1) return;

    const nextTrip: SavedTrip = {
      ...trip,
      days: trip.days.map((dayItem, index) =>
        index === dayIndex
          ? {
              ...dayItem,
              stops: dayItem.stops.filter((_, currentStopIndex) => currentStopIndex !== stopIndex)
            }
          : dayItem
      )
    };
    updateTrip(nextTrip, "点位已删除，路线时间已重新估算。");
  }

  function moveStop(dayIndex: number, stopIndex: number, direction: -1 | 1) {
    const currentDay = trip.days[dayIndex];
    if (!currentDay) return;
    const targetIndex = stopIndex + direction;
    if (targetIndex < 0 || targetIndex >= currentDay.stops.length) return;

    const nextStops = [...currentDay.stops];
    const [movedStop] = nextStops.splice(stopIndex, 1);
    nextStops.splice(targetIndex, 0, movedStop);

    const nextTrip: SavedTrip = {
      ...trip,
      days: trip.days.map((dayItem, index) =>
        index === dayIndex ? { ...dayItem, stops: nextStops } : dayItem
      )
    };
    updateTrip(nextTrip, "点位顺序已调整，路线时间已重新估算。");
  }

  function moveStopTo(dayIndex: number, fromIndex: number, toIndex: number) {
    const currentDay = trip.days[dayIndex];
    if (!currentDay || fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= currentDay.stops.length) return;
    if (toIndex < 0 || toIndex >= currentDay.stops.length) return;

    const nextStops = [...currentDay.stops];
    const [movedStop] = nextStops.splice(fromIndex, 1);
    nextStops.splice(toIndex, 0, movedStop);

    const nextTrip: SavedTrip = {
      ...trip,
      days: trip.days.map((dayItem, index) =>
        index === dayIndex ? { ...dayItem, stops: nextStops } : dayItem
      )
    };
    updateTrip(nextTrip, "点位顺序已调整，路线时间已重新估算。");
  }

  function saveTrip() {
    const now = new Date().toISOString();
    const nextTrip: SavedTrip = {
      ...recalculateTrip(trip),
      status: "planned",
      revision: trip.revision + 1,
      savedAt: now,
      updatedAt: now
    };
    saveSavedTrip(nextTrip);
    const footprint = lightFootprintCity({
      city: nextTrip.destination,
      tripId: nextTrip.id,
      visitedAt: now,
      source: "saved_trip"
    });
    setTrip(nextTrip);
    setShowAccountPrompt(!readUserProfile());
    setFeedback(
      footprint
        ? `已保存为 planned 状态，并点亮 ${footprint.city}。`
        : "已保存为 planned 状态，刷新后仍会保留。"
    );
  }

  return (
    <main className="app-shell subpage-shell">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
        <span className="flower flower-two" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span>TripPlan Result</span>
      </header>

      <section className="trip-hero glass-card">
        <div className="trip-title-block">
          <p className="eyebrow">AI Travel Memory</p>
          <h1>{trip.destination} 旅行日记</h1>
          <div className="hero-meta">
            <span>{trip.startDate}</span>
            <span>{trip.days.length} 天</span>
            <span>{trip.status === "planned" ? "已保存" : "草稿"}</span>
          </div>
          <p>{trip.summary}</p>
        </div>

        <div className="thumbnail-uploader">
          <div className="thumbnail-preview">
            {thumbnail ? (
              <img src={thumbnail} alt="相册记忆缩略图" />
            ) : (
              <span>
                <Camera size={28} />
                Album Cover
              </span>
            )}
          </div>
          <label className="secondary-action thumbnail-action">
            <ImagePlus size={17} />
            上传缩略图
            <input accept="image/*" type="file" onChange={uploadThumbnail} />
          </label>
        </div>
      </section>

      <section className="trip-summary-grid">
        <article className="summary-tile glass-card">
          <Wallet size={18} />
          <strong>CNY {trip.budget}</strong>
          <span>预估预算</span>
        </article>
        <article className="summary-tile glass-card">
          <Clock3 size={18} />
          <strong>{trip.travelMinutes} 分钟</strong>
          <span>路上时间</span>
        </article>
        <article className="summary-tile glass-card">
          <Route size={18} />
          <strong>{totalStops} 个点位</strong>
          <span>结构化停留</span>
        </article>
        <article className="summary-tile glass-card">
          <CheckCircle2 size={18} />
          <strong>{trip.score} 分</strong>
          <span>原型评分</span>
        </article>
      </section>

      <section className="result-layout">
        <article className="timeline-panel glass-card">
          <div className="section-title">
            <div>
              <p>Daily Route</p>
              <h2>{day.title}</h2>
            </div>
            <span>D{day.day}</span>
          </div>

          <div className="day-tabs" role="tablist" aria-label="选择天数">
            {trip.days.map((item, index) => (
              <button
                key={item.day}
                className={activeDay === index ? "active" : ""}
                type="button"
                onClick={() => setActiveDay(index)}
              >
                Day {item.day}
              </button>
            ))}
          </div>

          <div className="timeline-toolbar">
            <span>
              <BookmarkCheck size={15} />
              {trip.status === "planned" ? "已保存行程" : "未保存修改"}
            </span>
            <button className={editMode ? "active" : ""} type="button" onClick={() => setEditMode((value) => !value)}>
              <Pencil size={15} />
              {editMode ? "预览路线" : "编辑路线"}
            </button>
          </div>

          {feedback && <p className="inline-success">{feedback}</p>}

          <ol className="poi-timeline">
            {day.stops.map((stop, stopIndex) => (
              <li
                key={stop.id}
                className={[
                  "poi-stop",
                  stop.locked ? "locked" : "",
                  editMode ? "editable" : "",
                  draggedStop?.dayIndex === activeDay && draggedStop.stopIndex === stopIndex ? "dragging" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                draggable={editMode}
                onDragStart={() => setDraggedStop({ dayIndex: activeDay, stopIndex })}
                onDragOver={(event) => {
                  if (editMode) event.preventDefault();
                }}
                onDrop={() => {
                  if (draggedStop?.dayIndex === activeDay) {
                    moveStopTo(activeDay, draggedStop.stopIndex, stopIndex);
                  }
                  setDraggedStop(null);
                }}
                onDragEnd={() => setDraggedStop(null)}
              >
                <time>{stop.time}</time>
                <div>
                  <div className="stop-title-row">
                    <h3>{stop.name}</h3>
                    {stop.locked && <span>已锁定</span>}
                    {stop.replaced && <span>已替换</span>}
                  </div>
                  <p>{stop.note}</p>
                  <div className="stop-tags">
                    {stop.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <span
                    className={[
                      "route-note",
                      routeLegByStopId.get(stop.id)?.status === "confirmed" ? "confirmed" : "",
                      routeLegByStopId.get(stop.id)?.status === "pending" ? "pending" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {stop.duration} · {stop.transportToNext}
                  </span>
                  {editMode && (
                    <div className="stop-editor-actions" aria-label={`${stop.name} 编辑操作`}>
                      <button
                        type="button"
                        onClick={() => toggleStopLock(activeDay, stopIndex)}
                        title={stop.locked ? "解除锁定" : "锁定点位"}
                        aria-label={stop.locked ? "解除锁定" : "锁定点位"}
                      >
                        {stop.locked ? <Unlock size={15} /> : <Lock size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => replaceStop(activeDay, stopIndex)}
                        disabled={stop.locked}
                        title="替换点位"
                        aria-label="替换点位"
                      >
                        <Shuffle size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStop(activeDay, stopIndex, -1)}
                        disabled={stopIndex === 0}
                        title="上移"
                        aria-label="上移"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStop(activeDay, stopIndex, 1)}
                        disabled={stopIndex === day.stops.length - 1}
                        title="下移"
                        aria-label="下移"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStop(activeDay, stopIndex)}
                        disabled={stop.locked || day.stops.length <= 1}
                        title="删除点位"
                        aria-label="删除点位"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </article>

        <aside className="result-side">
          <section className="map-placeholder glass-card">
            <RouteMapPanel
              dayTitle={day.title}
              error={routeError}
              loading={routeLoading}
              route={routeResult}
            />
          </section>

          <section className="privacy-check glass-card">
            <h2>同步与公开链接</h2>
            <p>
              游客草稿保存在本地；公开链接只在点击后生成，后续绑定账号时再进入跨端同步。
            </p>
            <div className="trip-actions">
              <button className="primary-action" type="button" onClick={saveTrip}>
                <Save size={17} />
                保存行程
              </button>
              <button className="primary-action" type="button" onClick={generateShareLink} disabled={shareLoading}>
                <Share2 size={17} />
                {shareLoading ? "生成中" : "生成公开链接"}
              </button>
              <Link className="secondary-action action-link" href={`/share-poster/${trip.id}`}>
                <Palette size={17} />
                制作分享海报
              </Link>
              <button className="secondary-action" type="button" onClick={() => setEditMode((value) => !value)}>
                <Pencil size={17} />
                {editMode ? "预览路线" : "编辑路线"}
              </button>
              <Link className="secondary-action action-link" href="/create">
                <RefreshCcw size={17} />
                重新生成
              </Link>
              <button
                className="secondary-action"
                type="button"
                onClick={() => updateTrip(createEditableTrip(trip.destination), "已恢复默认路线，记得保存。")}
              >
                <RefreshCcw size={17} />
                恢复默认
              </button>
            </div>
            {shareUrl && (
              <div className="share-output">
                <code>{shareUrl}</code>
                <button type="button" onClick={copyShareLink} aria-label="复制公开链接">
                  <Copy size={16} />
                </button>
                {copied && <span>已复制</span>}
              </div>
            )}
            {shareError && <p className="inline-error">{shareError}</p>}
            {showAccountPrompt && (
              <div className="guest-link-prompt">
                <LockKeyhole size={16} />
                <span>游客模式已保存到本地。绑定账号后，后续可接入跨端同步。</span>
                <Link className="secondary-action action-link" href="/settings?panel=account&login=1">
                  绑定账号
                </Link>
              </div>
            )}
            <div className="privacy-row">
              <LockKeyhole size={15} />
              <span>默认私密，本地优先。</span>
            </div>
          </section>

          <section className="warning-card glass-card">
            <h2>出行提醒</h2>
            <ul>
              {trip.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

function RouteMapPanel({
  dayTitle,
  error,
  loading,
  route
}: {
  dayTitle: string;
  error: string;
  loading: boolean;
  route: RouteCalculationResult | null;
}) {
  const projectedPois = useMemo(() => projectPois(route?.pois.map((poi) => poi.location) ?? []), [route]);
  const totalMinutes = route?.summary.totalMinutes;
  const totalDistance = route?.summary.totalDistanceMeters;
  const gaodeSdkConfigured = Boolean(process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY);
  const [sdkState, setSdkState] = useState<"disabled" | "loading" | "ready" | "failed">(
    gaodeSdkConfigured ? "loading" : "disabled"
  );

  useEffect(() => {
    setSdkState(gaodeSdkConfigured && route ? "loading" : "disabled");
  }, [gaodeSdkConfigured, route?.cacheKey]);

  return (
    <div className="route-map-panel">
      <div className="section-title">
        <div>
          <p>Gaode Route</p>
          <h2>高德路线校准</h2>
        </div>
        <span>
          <LocateFixed size={22} />
        </span>
      </div>

      <div
        className={`route-map-stage ${sdkState === "ready" ? "is-sdk-ready" : ""}`}
        aria-label={`${dayTitle} 路线地图`}
      >
        {route && <RouteSketch projectedPois={projectedPois} route={route} />}
        {route && gaodeSdkConfigured && (
          <GaodeSdkCanvas onStatusChange={setSdkState} route={route} />
        )}
        {!route && (
          <div className="route-map-empty">
            <MapPinned size={28} />
            <span>{loading ? "正在校准路线" : "等待路线数据"}</span>
          </div>
        )}
        {route && gaodeSdkConfigured && sdkState !== "ready" && (
          <span className="route-sdk-badge">{sdkState === "failed" ? "地图底图待启用" : "正在加载地图"}</span>
        )}
      </div>

      <div className="route-map-summary">
        <span>
          {loading
            ? "校准中"
            : route?.status === "confirmed"
              ? sdkState === "ready"
                ? "高德地图已接入"
                : "高德已确认"
              : "待确认"}
        </span>
        <span>{totalMinutes === null || totalMinutes === undefined ? "时间待确认" : `${totalMinutes} 分钟`}</span>
        <span>{formatDistance(totalDistance)}</span>
      </div>

      {error ? (
        <p className="inline-error">{error}</p>
      ) : route?.summary.pendingReason ? (
        <p className="inline-success route-pending-note">{route.summary.pendingReason}</p>
      ) : sdkState === "ready" ? (
        <p className="route-confirmed-note">高德地图 SDK 已渲染底图、点位和路线，路线结果仍通过标准化字段进入前端。</p>
      ) : gaodeSdkConfigured && sdkState === "failed" ? (
        <p className="route-confirmed-note">地图底图暂不可用，已保留可保存的路线草图和高德通勤结果。</p>
      ) : (
        <p className="route-confirmed-note">路线结果已标准化，前端不读取高德原始字段。</p>
      )}
    </div>
  );
}

function RouteSketch({
  projectedPois,
  route
}: {
  projectedPois: Array<{ x: number; y: number }>;
  route: RouteCalculationResult;
}) {
  return (
    <>
      <svg className="route-line-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {projectedPois.slice(0, -1).map((point, index) => {
          const nextPoint = projectedPois[index + 1];
          if (!nextPoint) return null;
          return (
            <line
              key={`${point.x}-${point.y}-${index}`}
              x1={point.x}
              x2={nextPoint.x}
              y1={point.y}
              y2={nextPoint.y}
            />
          );
        })}
      </svg>
      {route.pois.map((poi, index) => {
        const point = projectedPois[index] ?? { x: 50, y: 50 };
        return (
          <span
            className="route-marker"
            key={poi.stopId}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`
            }}
            title={poi.name}
          >
            {index + 1}
          </span>
        );
      })}
    </>
  );
}

function GaodeSdkCanvas({
  onStatusChange,
  route
}: {
  onStatusChange: (status: "disabled" | "loading" | "ready" | "failed") => void;
  route: RouteCalculationResult;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY;
    const container = mapRef.current;
    if (!key || !container) {
      onStatusChange("disabled");
      return;
    }
    const mapKey = key;
    const mapContainer = container;

    let cancelled = false;
    let map: AMapMapInstance | null = null;

    async function loadMap() {
      try {
        onStatusChange("loading");
        const securityJsCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE;
        if (securityJsCode) {
          (window as AMapWindow)._AMapSecurityConfig = { securityJsCode };
        }

        const { load } = await import("@amap/amap-jsapi-loader");
        const AMap = (await load({
          key: mapKey,
          version: "2.0",
          plugins: ["AMap.Scale", "AMap.ToolBar"]
        })) as AMapFactory;

        if (cancelled) return;

        const center = getRouteCenter(route);
        map = new AMap.Map(mapContainer, {
          center: [center.lng, center.lat],
          mapStyle: "amap://styles/macaron",
          resizeEnable: true,
          viewMode: "2D",
          zoom: route.pois.length > 1 ? 13 : 14
        });

        const markers = route.pois.map((poi, index) =>
          new AMap.Marker({
            anchor: "center",
            label: {
              content: `<span class="amap-route-label">${index + 1}</span>`,
              direction: "center",
              offset: AMap.Pixel ? new AMap.Pixel(0, 0) : undefined
            },
            position: [poi.location.lng, poi.location.lat],
            title: poi.name
          })
        );
        const path = route.legs.flatMap((leg) => leg.polyline).map((point) => [point.lng, point.lat]);
        const polyline = path.length >= 2
          ? new AMap.Polyline({
              lineJoin: "round",
              path,
              showDir: true,
              strokeColor: "#5a91a5",
              strokeOpacity: 0.92,
              strokeWeight: 5
            })
          : null;
        const overlays = polyline ? [...markers, polyline] : markers;

        map.add(overlays);
        if (AMap.Scale && map.addControl) map.addControl(new AMap.Scale());
        if (AMap.ToolBar && map.addControl) map.addControl(new AMap.ToolBar({ position: "RB" }));
        map.setFitView?.(overlays, false, [28, 28, 28, 28]);
        onStatusChange("ready");
      } catch {
        onStatusChange("failed");
      }
    }

    void loadMap();

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [onStatusChange, route, route.cacheKey]);

  return <div aria-hidden="true" className="gaode-sdk-canvas" ref={mapRef} />;
}

function projectPois(points: GeoPoint[]) {
  if (points.length === 0) return [];
  const lngs = points.map((point) => point.lng);
  const lats = points.map((point) => point.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lngRange = Math.max(maxLng - minLng, 0.001);
  const latRange = Math.max(maxLat - minLat, 0.001);

  return points.map((point) => ({
    x: 14 + ((point.lng - minLng) / lngRange) * 72,
    y: 14 + (1 - (point.lat - minLat) / latRange) * 72
  }));
}

function formatDistance(value: number | null | undefined) {
  if (value === null || value === undefined) return "距离待确认";
  if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
  return `${value} m`;
}

function getRouteCenter(route: RouteCalculationResult): GeoPoint {
  const points = route.pois.map((poi) => poi.location);
  if (points.length === 0) return { lng: 120.1432, lat: 30.2592 };
  return {
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length,
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length
  };
}
