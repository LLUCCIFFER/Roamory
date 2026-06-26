"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Link2,
  LockKeyhole,
  MapPinned,
  Palette,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { mockTrip } from "../../../lib/mock-data";
import {
  defaultSharePosterPrivacy,
  readDefaultSharePosterPrivacy,
  readAlbumThumbnail,
  readSavedTrip,
  readSharePosterDraft,
  saveSharePosterDraft
} from "../../../lib/storage";
import type {
  SavedTrip,
  SharePosterPrivacy,
  SharePosterTemplate
} from "../../../lib/storage";

const posterTemplates: Array<{
  id: SharePosterTemplate;
  label: string;
  note: string;
}> = [
  { id: "diary", label: "云边日记", note: "适合发朋友圈的柔和封面" },
  { id: "route", label: "路线明信片", note: "突出天数、路线与节奏" },
  { id: "memory", label: "记忆封面", note: "更像旅行相册第一页" }
];

function createMockTrip(): SavedTrip {
  const now = new Date().toISOString();
  return {
    id: mockTrip.id,
    status: "draft",
    title: `${mockTrip.destination} 旅行日记`,
    destination: mockTrip.destination,
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
  };
}

function timeBucket(index: number) {
  if (index === 0) return "上午";
  if (index === 1) return "下午";
  return "傍晚";
}

function getTotalStops(trip: SavedTrip) {
  return trip.days.reduce((count, day) => count + day.stops.length, 0);
}

function formatStopName(trip: SavedTrip, name: string, index: number, privacy: SharePosterPrivacy) {
  return privacy.showExactLocation ? name : `${trip.destination} 城市记忆 ${index + 1}`;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
) {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = "";

  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);

  lines.slice(0, maxLines).forEach((line, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? "..." : "";
    ctx.fillText(`${line}${suffix}`, x, y + index * lineHeight);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function createPosterPng(trip: SavedTrip, template: SharePosterTemplate, privacy: SharePosterPrivacy) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#BFE8FA");
  gradient.addColorStop(0.56, "#DFF5FF");
  gradient.addColorStop(1, "#F8FCFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.beginPath();
  ctx.ellipse(190, 180, 180, 54, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(820, 230, 230, 70, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(127,167,189,0.22)";
  ctx.beginPath();
  ctx.moveTo(-80, 1190);
  ctx.lineTo(350, 720);
  ctx.lineTo(780, 1190);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(370, 1240);
  ctx.lineTo(760, 850);
  ctx.lineTo(1150, 1240);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(248,252,255,0.78)";
  roundRect(ctx, 88, 118, 904, 1130, 32);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 5;
  for (let x = 95; x < 980; x += 34) {
    ctx.beginPath();
    ctx.arc(x, 1250, 16, Math.PI, 0);
    ctx.stroke();
  }

  ctx.fillStyle = "#4F7484";
  ctx.font = "900 32px Inter, sans-serif";
  ctx.fillText(template === "route" ? "ROUTE MEMORY" : template === "memory" ? "TRAVEL COVER" : "ROAMORY DIARY", 140, 206);

  ctx.fillStyle = "#243D4A";
  ctx.font = "900 88px Inter, sans-serif";
  drawWrappedText(ctx, `${trip.destination} 旅行日记`, 140, 315, 780, 94, 2);

  ctx.fillStyle = "#4F7484";
  ctx.font = "700 31px Inter, sans-serif";
  drawWrappedText(ctx, trip.summary, 140, 510, 780, 46, 3);

  const badgeY = 695;
  const badgeItems = [
    `${trip.days.length} 天`,
    `${getTotalStops(trip)} 个点位`,
    privacy.showBudget ? `CNY ${trip.budget}` : "预算已隐藏"
  ];
  badgeItems.forEach((item, index) => {
    const x = 140 + index * 270;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    roundRect(ctx, x, badgeY, 232, 72, 36);
    ctx.fill();
    ctx.fillStyle = "#4F7484";
    ctx.font = "900 28px Inter, sans-serif";
    ctx.fillText(item, x + 28, badgeY + 46);
  });

  ctx.fillStyle = template === "memory" ? "rgba(246,238,219,0.88)" : "rgba(255,255,255,0.68)";
  roundRect(ctx, 140, 842, 800, 260, 24);
  ctx.fill();

  ctx.fillStyle = "#243D4A";
  ctx.font = "900 36px Inter, sans-serif";
  ctx.fillText(template === "route" ? "今日路线摘记" : "公开内容预览", 182, 900);

  trip.days[0]?.stops.slice(0, 3).forEach((stop, index) => {
    const time = privacy.showExactTimes ? stop.time : timeBucket(index);
    const name = formatStopName(trip, stop.name, index, privacy);
    ctx.fillStyle = "#4F7484";
    ctx.font = "900 26px Inter, sans-serif";
    ctx.fillText(time, 184, 960 + index * 56);
    ctx.fillStyle = "#243D4A";
    ctx.font = "800 28px Inter, sans-serif";
    ctx.fillText(name, 300, 960 + index * 56);
  });

  ctx.fillStyle = "#4F7484";
  ctx.font = "900 26px Inter, sans-serif";
  ctx.fillText(privacy.showMap ? "路线地图可见" : "地图已隐藏", 140, 1172);
  ctx.fillText(privacy.showExactLocation ? "点位可见" : "位置已模糊至城市级", 140, 1212);

  ctx.fillStyle = "#243D4A";
  ctx.font = "900 28px Inter, sans-serif";
  ctx.fillText("Slow down, breathe deeply, and collect the little joys.", 140, 1320);

  return canvas.toDataURL("image/png");
}

export default function SharePosterPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const [trip, setTrip] = useState<SavedTrip>(() => createMockTrip());
  const [template, setTemplate] = useState<SharePosterTemplate>("diary");
  const [privacy, setPrivacy] = useState<SharePosterPrivacy>(() => defaultSharePosterPrivacy());
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [exportedImage, setExportedImage] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [publicToken, setPublicToken] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const totalStops = useMemo(() => getTotalStops(trip), [trip]);
  const canPublish = trip.status === "planned" && accepted;

  useEffect(() => {
    const savedTrip = readSavedTrip(tripId);
    const draft = readSharePosterDraft(tripId);
    setTrip(savedTrip ?? createMockTrip());
    setThumbnail(readAlbumThumbnail(tripId));
    if (draft) {
      setTemplate(draft.template);
      setPrivacy(draft.privacy);
      setExportedImage(draft.exportedImage ?? "");
      setPublicUrl(draft.publicUrl ?? "");
      setPublicToken(draft.publicToken ?? "");
    } else {
      setPrivacy(readDefaultSharePosterPrivacy());
    }
  }, [tripId]);

  function persist(next: {
    template?: SharePosterTemplate;
    privacy?: SharePosterPrivacy;
    exportedImage?: string;
    publicUrl?: string;
    publicToken?: string;
  }) {
    saveSharePosterDraft({
      tripId,
      template: next.template ?? template,
      privacy: next.privacy ?? privacy,
      exportedImage: next.exportedImage ?? exportedImage,
      publicUrl: next.publicUrl ?? publicUrl,
      publicToken: next.publicToken ?? publicToken,
      updatedAt: new Date().toISOString()
    });
  }

  function updateTemplate(nextTemplate: SharePosterTemplate) {
    setTemplate(nextTemplate);
    persist({ template: nextTemplate });
  }

  function updatePrivacy(key: keyof SharePosterPrivacy) {
    const nextPrivacy = {
      ...privacy,
      [key]: !privacy[key]
    };
    setPrivacy(nextPrivacy);
    setAccepted(false);
    persist({ privacy: nextPrivacy });
  }

  function savePosterImage() {
    const dataUrl = createPosterPng(trip, template, privacy);
    if (!dataUrl) {
      setMessage("图片生成失败，请稍后再试。");
      return;
    }
    setExportedImage(dataUrl);
    persist({ exportedImage: dataUrl });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `roamory-${trip.destination}-poster.png`;
    link.click();
    setMessage("海报图片已生成并保存。");
  }

  async function createPublicLink() {
    if (!canPublish) return;
    setMessage("");
    const response = await fetch("/api/share-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        privacy
      })
    });
    const payload = (await response.json()) as {
      shareLink?: { token: string; publicUrl: string };
      message?: string;
    };
    if (!response.ok || !payload.shareLink) {
      setMessage(payload.message || "公开链接生成失败。");
      return;
    }
    setPublicUrl(payload.shareLink.publicUrl);
    setPublicToken(payload.shareLink.token);
    setCopied(false);
    persist({
      publicUrl: payload.shareLink.publicUrl,
      publicToken: payload.shareLink.token
    });
    setMessage("公开链接已按当前隐私设置生成。");
  }

  async function closePublicLink() {
    if (!publicToken) return;
    const response = await fetch(`/api/share-links/${publicToken}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      setMessage("公开链接关闭失败，请稍后再试。");
      return;
    }
    setPublicUrl("");
    setPublicToken("");
    setCopied(false);
    persist({ publicUrl: "", publicToken: "" });
    setMessage("公开链接已关闭。");
  }

  async function copyPublicLink() {
    if (!publicUrl) return;
    await window.navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
  }

  return (
    <main className="app-shell subpage-shell poster-shell">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
        <span className="flower flower-two" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href={`/trips/${tripId}`}>
          <ArrowLeft size={18} />
          返回行程
        </Link>
        <span>Share Poster</span>
      </header>

      <section className="poster-hero glass-card">
        <div>
          <p className="eyebrow">Roamory Share</p>
          <h1>分享前，先看清会公开什么</h1>
          <p>海报和公开链接都沿用同一组隐私开关，默认隐藏地图、具体时间和精确点位。</p>
        </div>
        <span className={trip.status === "planned" ? "poster-state ready" : "poster-state"}>
          {trip.status === "planned" ? <CheckCircle2 size={17} /> : <LockKeyhole size={17} />}
          {trip.status === "planned" ? "可公开分享" : "先保存为 planned"}
        </span>
      </section>

      <section className="poster-layout">
        <article className="poster-preview-panel glass-card">
          <div className="section-title">
            <div>
              <p>Preview</p>
              <h2>{posterTemplates.find((item) => item.id === template)?.label}</h2>
            </div>
            <span>{trip.destination}</span>
          </div>

          <div className={`poster-preview ${template}`} aria-label="分享海报预览">
            <div className="poster-watermark">Roamory</div>
            {thumbnail && privacy.showThumbnail && <img src={thumbnail} alt="" />}
            <div className="poster-card">
              <p>{template === "route" ? "ROUTE MEMORY" : template === "memory" ? "TRAVEL COVER" : "CASUAL DIARY"}</p>
              <h2>{trip.destination} 旅行日记</h2>
              <span>{trip.summary}</span>
              <div className="poster-metrics">
                <strong>{trip.days.length} 天</strong>
                <strong>{totalStops} 点</strong>
                {privacy.showBudget ? <strong>CNY {trip.budget}</strong> : <strong>预算隐藏</strong>}
              </div>
              <ol>
                {trip.days[0]?.stops.slice(0, 3).map((stop, index) => (
                  <li key={stop.id}>
                    <small>{privacy.showExactTimes ? stop.time : timeBucket(index)}</small>
                    <span>{formatStopName(trip, stop.name, index, privacy)}</span>
                  </li>
                ))}
              </ol>
              <footer>
                <span>{privacy.showMap ? "路线地图可见" : "地图已隐藏"}</span>
                <span>{privacy.showExactLocation ? "点位可见" : "位置已模糊"}</span>
              </footer>
            </div>
          </div>
        </article>

        <aside className="poster-control-stack">
          <section className="poster-control-card glass-card">
            <div className="section-title">
              <div>
                <p>Templates</p>
                <h2>海报模板</h2>
              </div>
              <span>
                <Palette size={22} />
              </span>
            </div>
            <div className="poster-template-grid">
              {posterTemplates.map((item) => (
                <button
                  className={template === item.id ? "active" : ""}
                  key={item.id}
                  type="button"
                  onClick={() => updateTemplate(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.note}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="poster-control-card glass-card">
            <div className="section-title">
              <div>
                <p>Privacy</p>
                <h2>公开内容</h2>
              </div>
              <span>
                <ShieldCheck size={22} />
              </span>
            </div>
            <div className="privacy-toggle-list">
              <PrivacyToggle
                icon={<Wallet size={17} />}
                label="显示预算"
                checked={privacy.showBudget}
                onChange={() => updatePrivacy("showBudget")}
              />
              <PrivacyToggle
                icon={<MapPinned size={17} />}
                label="显示地图"
                checked={privacy.showMap}
                onChange={() => updatePrivacy("showMap")}
              />
              <PrivacyToggle
                icon={privacy.showExactLocation ? <Eye size={17} /> : <EyeOff size={17} />}
                label="显示精确点位"
                checked={privacy.showExactLocation}
                onChange={() => updatePrivacy("showExactLocation")}
              />
              <PrivacyToggle
                icon={privacy.showExactTimes ? <Eye size={17} /> : <EyeOff size={17} />}
                label="显示具体时间"
                checked={privacy.showExactTimes}
                onChange={() => updatePrivacy("showExactTimes")}
              />
            </div>
          </section>

          <section className="poster-control-card glass-card">
            <div className="section-title">
              <div>
                <p>Check</p>
                <h2>分享前检查</h2>
              </div>
              <span>
                <LockKeyhole size={22} />
              </span>
            </div>
            <ul className="privacy-review-list">
              <li>
                {privacy.showBudget ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                {privacy.showBudget ? "预算会公开展示。" : "预算已从海报和公开链接隐藏。"}
              </li>
              <li>
                {privacy.showExactLocation ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                {privacy.showExactLocation ? "具体点位会公开。" : "具体点位已模糊为城市级记忆。"}
              </li>
              <li>
                {privacy.showExactTimes ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                {privacy.showExactTimes ? "具体时间会公开。" : "具体时间已替换为上午/下午/傍晚。"}
              </li>
              <li>
                {trip.status === "planned" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {trip.status === "planned" ? "行程已保存，可以生成公开链接。" : "私密草稿不能直接公开分享。"}
              </li>
            </ul>
            <label className="privacy-accept">
              <input checked={accepted} type="checkbox" onChange={(event) => setAccepted(event.target.checked)} />
              我已检查公开内容
            </label>
          </section>

          <section className="poster-control-card glass-card">
            <div className="poster-action-grid">
              <button className="primary-action" type="button" onClick={savePosterImage}>
                <Download size={17} />
                保存图片
              </button>
              <button className="primary-action" type="button" onClick={createPublicLink} disabled={!canPublish}>
                <Share2 size={17} />
                生成公开链接
              </button>
            </div>
            {exportedImage && (
              <a className="secondary-action action-link" href={exportedImage} download={`roamory-${trip.destination}-poster.png`}>
                <Sparkles size={17} />
                再次下载海报
              </a>
            )}
            {publicUrl && (
              <div className="poster-share-output">
                <code>{publicUrl}</code>
                <button type="button" onClick={copyPublicLink} aria-label="复制公开链接">
                  <Copy size={16} />
                </button>
                <button type="button" onClick={closePublicLink}>
                  <Link2 size={16} />
                  关闭
                </button>
                {copied && <span>已复制</span>}
              </div>
            )}
            {message && <p className="inline-success poster-message">{message}</p>}
          </section>
        </aside>
      </section>
    </main>
  );
}

function PrivacyToggle({
  icon,
  label,
  checked,
  onChange
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="privacy-toggle">
      <span>
        {icon}
        {label}
      </span>
      <input checked={checked} type="checkbox" onChange={onChange} />
    </label>
  );
}
