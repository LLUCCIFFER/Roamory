"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Combine,
  EyeOff,
  ImagePlus,
  Layers2,
  MapPinned,
  Scissors,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  deletePhotoMemoryCandidate,
  lightFootprintCity,
  readPhotoMemoryCandidates,
  saveAlbumThumbnail,
  savePhotoMemoryCandidates,
  saveSavedTrip,
  updatePhotoMemoryCandidateStatus,
  upsertPhotoMemoryCandidate
} from "../../lib/storage";
import type { PhotoMemoryCandidate, PhotoMemoryThumbnail, SavedTrip } from "../../lib/storage";

const knownCities = ["杭州", "成都", "厦门", "大理", "苏州", "上海"];

const sampleImages = [
  {
    name: "hangzhou-west-lake.jpg",
    city: "杭州",
    color: "#8fd3ef",
    label: "West Lake",
    capturedAt: "2026-10-02T09:30:00.000Z"
  },
  {
    name: "hangzhou-tea-hill.jpg",
    city: "杭州",
    color: "#9bd4b3",
    label: "Tea Hill",
    capturedAt: "2026-10-03T15:10:00.000Z"
  },
  {
    name: "hangzhou-canal-walk.jpg",
    city: "杭州",
    color: "#b9def0",
    label: "Canal",
    capturedAt: "2026-10-04T13:30:00.000Z"
  }
];

export default function MemoriesPage() {
  const [candidates, setCandidates] = useState<PhotoMemoryCandidate[]>([]);
  const [selectedCity, setSelectedCity] = useState("杭州");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allowOriginalBackup, setAllowOriginalBackup] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setCandidates(readPhotoMemoryCandidates());
  }, []);

  const activeCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.status !== "ignored"),
    [candidates]
  );
  const stats = useMemo(
    () => ({
      total: candidates.length,
      confirmed: candidates.filter((candidate) => candidate.status === "confirmed").length,
      photos: candidates.reduce((sum, candidate) => sum + candidate.photoCount, 0)
    }),
    [candidates]
  );

  function refresh(message?: string) {
    setCandidates(readPhotoMemoryCandidates());
    if (message) setNotice(message);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    const thumbnails = await Promise.all(files.slice(0, 8).map((file) => createThumbnail(file)));
    const city = inferCity(files.map((file) => file.name).join(" "), selectedCity);
    const candidate = createCandidate({
      city,
      thumbnails,
      title: `${city} 相册片段`
    });
    upsertPhotoMemoryCandidate(candidate);
    event.target.value = "";
    refresh("已读取缩略图和本地文件元数据。");
  }

  function addSampleCandidate() {
    const thumbnails = sampleImages.map((item, index) => ({
      id: `sample_thumb_${Date.now()}_${index}`,
      name: item.name,
      dataUrl: createSampleDataUrl(item.color, item.label),
      capturedAt: item.capturedAt,
      size: 148000 + index * 32000,
      type: "image/jpeg"
    }));
    const candidate = createCandidate({
      city: "杭州",
      thumbnails,
      title: "杭州秋日相册"
    });
    upsertPhotoMemoryCandidate(candidate);
    refresh("已生成一组示例候选旅行。");
  }

  function confirmCandidate(candidate: PhotoMemoryCandidate) {
    const trip = createTripFromCandidate(candidate);
    saveSavedTrip(trip);
    if (candidate.thumbnails[0]) saveAlbumThumbnail(trip.id, candidate.thumbnails[0].dataUrl);
    lightFootprintCity({
      city: candidate.city,
      tripId: trip.id,
      visitedAt: candidate.startDate,
      source: "saved_trip",
      privacy: "private",
      note: "来自相册记忆确认"
    });
    updatePhotoMemoryCandidateStatus(candidate.id, "confirmed", trip.id);
    refresh("已生成旅行记录并点亮足迹。");
  }

  function ignoreCandidate(candidateId: string) {
    updatePhotoMemoryCandidateStatus(candidateId, "ignored");
    refresh("已忽略候选记忆。");
  }

  function removeCandidate(candidateId: string) {
    deletePhotoMemoryCandidate(candidateId);
    setSelectedIds((ids) => ids.filter((id) => id !== candidateId));
    refresh("已删除候选记忆和缩略图引用。");
  }

  function splitCandidate(candidate: PhotoMemoryCandidate) {
    if (candidate.thumbnails.length <= 1) {
      refresh("至少需要 2 张缩略图才能拆分。");
      return;
    }
    const now = new Date().toISOString();
    const splitItems = candidate.thumbnails.map((thumbnail, index) =>
      createCandidate({
        city: candidate.city,
        thumbnails: [thumbnail],
        title: `${candidate.city} 片段 ${index + 1}`,
        now
      })
    );
    savePhotoMemoryCandidates([
      ...splitItems,
      ...candidates.filter((item) => item.id !== candidate.id)
    ]);
    setSelectedIds((ids) => ids.filter((id) => id !== candidate.id));
    refresh("已按缩略图拆分候选旅行。");
  }

  function mergeSelectedCandidates() {
    const selected = candidates.filter((candidate) => selectedIds.includes(candidate.id));
    if (selected.length < 2) {
      refresh("请选择至少 2 个候选记忆。");
      return;
    }
    const city = selected[0]?.city ?? selectedCity;
    const merged = createCandidate({
      city,
      thumbnails: selected.flatMap((candidate) => candidate.thumbnails).slice(0, 8),
      title: `${city} 合并相册`
    });
    savePhotoMemoryCandidates([
      merged,
      ...candidates.filter((candidate) => !selectedIds.includes(candidate.id))
    ]);
    setSelectedIds([]);
    refresh("已合并候选记忆。");
  }

  function toggleSelected(candidateId: string) {
    setSelectedIds((ids) =>
      ids.includes(candidateId) ? ids.filter((id) => id !== candidateId) : [...ids, candidateId]
    );
  }

  return (
    <main className="app-shell memory-page">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
        <span className="flower flower-two" />
      </div>

      <section className="memory-hero glass-card">
        <Link className="back-link" href="/">
          <ArrowLeft size={17} />
          返回
        </Link>
        <div>
          <p className="eyebrow">Photo Memory</p>
          <h1>相册记忆</h1>
          <p>缩略图和文件时间只保存在本地，确认后才会生成旅行记录。</p>
        </div>
        <div className="memory-hero-stats">
          <span>{stats.total} 个候选</span>
          <span>{stats.confirmed} 个已确认</span>
          <span>{stats.photos} 张缩略图</span>
        </div>
      </section>

      <section className="memory-workbench">
        <article className="memory-privacy-panel glass-card">
          <div className="section-title">
            <div>
              <p>Local first</p>
              <h2>相册授权说明</h2>
            </div>
            <span>
              <EyeOff size={21} />
            </span>
          </div>
          <div className="memory-permission-grid">
            <span>
              <BadgeCheck size={16} />
              只保存缩略图
            </span>
            <span>
              <BadgeCheck size={16} />
              原图备份{allowOriginalBackup ? "待接入" : "关闭"}
            </span>
            <span>
              <BadgeCheck size={16} />
              候选记录可删除
            </span>
          </div>
          <label className="memory-city-picker">
            <span>默认城市</span>
            <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
              {knownCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="memory-original-toggle">
            <input
              type="checkbox"
              checked={allowOriginalBackup}
              onChange={(event) => {
                setAllowOriginalBackup(event.target.checked);
                setNotice(event.target.checked ? "原图备份会在账号同步阶段单独确认。" : "已保持仅保存缩略图。");
              }}
            />
            <span>允许后续单独确认原图备份</span>
          </label>
          <div className="memory-import-actions">
            <label className="primary-action memory-upload-action">
              <ImagePlus size={17} />
              导入缩略图
              <input type="file" accept="image/*" multiple onChange={handleUpload} />
            </label>
            <button className="secondary-action" type="button" onClick={addSampleCandidate}>
              <Camera size={17} />
              示例照片包
            </button>
          </div>
        </article>

        <article className="memory-cluster-panel glass-card">
          <div className="section-title">
            <div>
              <p>Candidate Trips</p>
              <h2>候选旅行</h2>
            </div>
            <span>
              <Layers2 size={21} />
            </span>
          </div>
          <button className="secondary-action" type="button" onClick={mergeSelectedCandidates}>
            <Combine size={16} />
            合并选择
          </button>
          {notice && <p className="inline-success memory-notice">{notice}</p>}
        </article>
      </section>

      <section className="memory-candidate-grid" aria-label="候选旅行列表">
        {activeCandidates.length === 0 ? (
          <article className="memory-empty glass-card">
            <ImagePlus size={28} />
            <h2>还没有候选记忆</h2>
            <p>导入几张缩略图后，会在这里看到按城市和时间整理出的旅行片段。</p>
          </article>
        ) : (
          activeCandidates.map((candidate) => (
            <article className="memory-candidate-card glass-card" key={candidate.id}>
              <div className="memory-cover-strip">
                {candidate.thumbnails.slice(0, 4).map((thumbnail) => (
                  <img key={thumbnail.id} src={thumbnail.dataUrl} alt="" />
                ))}
              </div>
              <div className="memory-card-body">
                <label className="memory-select-row">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => toggleSelected(candidate.id)}
                  />
                  <span>加入合并</span>
                </label>
                <h2>{candidate.title}</h2>
                <div className="memory-meta-grid">
                  <span>
                    <MapPinned size={14} />
                    {candidate.city}
                  </span>
                  <span>{formatDateRange(candidate.startDate, candidate.endDate)}</span>
                  <span>{candidate.photoCount} 张缩略图</span>
                  <span>{candidate.confidence} 分可信度</span>
                </div>
                <p>{candidate.thumbnails[0]?.name ?? "本地缩略图"} · {formatBytes(candidate.thumbnails[0]?.size ?? 0)}</p>
                {candidate.status === "confirmed" && candidate.tripId ? (
                  <Link className="primary-action action-link" href={`/trips/${candidate.tripId}`}>
                    <CheckCircle2 size={16} />
                    打开旅行
                  </Link>
                ) : (
                  <div className="memory-card-actions">
                    <button className="primary-action" type="button" onClick={() => confirmCandidate(candidate)}>
                      <CheckCircle2 size={16} />
                      确认生成
                    </button>
                    <button className="secondary-action" type="button" onClick={() => splitCandidate(candidate)}>
                      <Scissors size={16} />
                      拆分
                    </button>
                    <button className="secondary-action" type="button" onClick={() => ignoreCandidate(candidate.id)}>
                      忽略
                    </button>
                    <button className="icon-button" type="button" onClick={() => removeCandidate(candidate.id)} aria-label="删除候选记忆">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function createCandidate({
  city,
  now = new Date().toISOString(),
  thumbnails,
  title
}: {
  city: string;
  now?: string;
  thumbnails: PhotoMemoryThumbnail[];
  title: string;
}): PhotoMemoryCandidate {
  const sorted = [...thumbnails].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  return {
    id: `photo_memory_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    status: "candidate",
    title,
    city,
    startDate: sorted[0]?.capturedAt ?? now,
    endDate: sorted.at(-1)?.capturedAt ?? sorted[0]?.capturedAt ?? now,
    photoCount: sorted.length,
    confidence: Math.min(96, 72 + sorted.length * 6),
    thumbnails: sorted,
    createdAt: now,
    updatedAt: now
  };
}

function createTripFromCandidate(candidate: PhotoMemoryCandidate): SavedTrip {
  const now = new Date().toISOString();
  const tripId = `memory-${candidate.id}`;
  return {
    id: tripId,
    status: "planned",
    title: `${candidate.city} 相册记忆`,
    destination: candidate.city,
    startDate: candidate.startDate,
    budget: 0,
    travelMinutes: 0,
    score: candidate.confidence,
    summary: `从 ${candidate.photoCount} 张本地缩略图整理出的旅行记忆。`,
    warnings: ["原图未保存；如需云端同步，请在账号与隐私设置中再次确认。"],
    days: [
      {
        day: 1,
        title: formatDateRange(candidate.startDate, candidate.endDate),
        budget: 0,
        travelMinutes: 0,
        stops: [
          {
            id: `${tripId}-album`,
            time: "上午",
            name: `${candidate.city} 相册片段`,
            duration: `${candidate.photoCount} 张缩略图`,
            transportToNext: "来自照片记忆",
            tags: ["相册记忆", "本地生成"],
            note: "由缩略图时间和城市线索生成，可在结果页继续编辑。",
            locked: false,
            replaced: false
          }
        ]
      }
    ],
    revision: 1,
    createdAt: now,
    updatedAt: now,
    savedAt: now
  };
}

async function createThumbnail(file: File): Promise<PhotoMemoryThumbnail> {
  const dataUrl = await resizeImage(file);
  return {
    id: `thumb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    dataUrl,
    capturedAt: new Date(file.lastModified || Date.now()).toISOString(),
    size: file.size,
    type: file.type || "image/*"
  };
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result ?? "");
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSide = 420;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context?.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.74));
        } catch {
          resolve(source);
        }
      };
      image.onerror = () => resolve(source);
      image.src = source;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function inferCity(text: string, fallback: string) {
  return knownCities.find((city) => text.includes(city) || text.toLowerCase().includes(city.toLowerCase())) ?? fallback;
}

function createSampleDataUrl(color: string, label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="300" viewBox="0 0 420 300">
      <rect width="420" height="300" fill="${color}"/>
      <circle cx="92" cy="74" r="58" fill="rgba(255,255,255,.55)"/>
      <path d="M0 236 C68 198 126 214 184 181 C252 143 303 171 420 123 L420 300 L0 300 Z" fill="rgba(255,255,255,.62)"/>
      <path d="M30 247 C88 225 142 231 198 203 C262 172 318 190 390 160" fill="none" stroke="rgba(79,116,132,.62)" stroke-width="5" stroke-linecap="round"/>
      <text x="28" y="270" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#4f7484">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function formatDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" });
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime())) return "时间待确认";
  if (Number.isNaN(endDate.getTime()) || startDate.toDateString() === endDate.toDateString()) {
    return formatter.format(startDate);
  }
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function formatBytes(value: number) {
  if (!value) return "大小待确认";
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(value / 1024)} KB`;
}
