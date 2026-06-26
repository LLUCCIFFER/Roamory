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
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
import type { SavedTrip, SavedTripDay, SavedTripStop } from "../../../lib/storage";

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

  const day = trip.days[activeDay] ?? trip.days[0];
  const totalStops = useMemo(
    () => trip.days.reduce((count, item) => count + item.stops.length, 0),
    [trip.days]
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
                  <span className="route-note">{stop.duration} · {stop.transportToNext}</span>
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
            <MapPinned size={34} />
            <h2>高德路线校准</h2>
            <p>路线与交通时间会在地图校准后显示在这里。</p>
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
