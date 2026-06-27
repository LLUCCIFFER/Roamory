"use client";

import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ImagePlus,
  Layers3,
  MapPinned,
  PackageOpen,
  RefreshCcw,
  Share2,
  Sparkles,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  buildAnnualReportSeed,
  deleteSouvenir,
  lightFootprintCity,
  readSavedTrips,
  readSouvenirs,
  upsertSouvenir
} from "../../lib/storage";
import type { AnnualReportSeed, SavedTrip, SouvenirDisplayMode, SouvenirMemory } from "../../lib/storage";

type SouvenirForm = {
  title: string;
  city: string;
  tripId: string;
  note: string;
  tags: string;
  displayMode: SouvenirDisplayMode;
  imageDataUrl: string;
};

const defaultForm: SouvenirForm = {
  title: "西湖车票与晚风",
  city: "杭州",
  tripId: "",
  note: "把那天傍晚的风留在一张小小的票根里。",
  tags: "票根,晚霞,散步",
  displayMode: "layered",
  imageDataUrl: ""
};

export default function SouvenirsPage() {
  const [form, setForm] = useState<SouvenirForm>(defaultForm);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [souvenirs, setSouvenirs] = useState<SouvenirMemory[]>([]);
  const [reportSeed, setReportSeed] = useState<AnnualReportSeed | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const selectedTrip = useMemo(
    () => savedTrips.find((trip) => trip.id === form.tripId),
    [form.tripId, savedTrips]
  );

  function refresh() {
    setSavedTrips(readSavedTrips());
    setSouvenirs(readSouvenirs());
    setReportSeed(buildAnnualReportSeed());
  }

  function updateForm<K extends keyof SouvenirForm>(key: K, value: SouvenirForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImageInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const imageDataUrl = await resizeSouvenirImage(file);
    updateForm("imageDataUrl", imageDataUrl);
    event.target.value = "";
    setMessage("已读取本地缩略图，原图不会上传。");
  }

  function saveSouvenir() {
    const title = form.title.trim();
    const city = form.city.trim() || selectedTrip?.destination || "杭州";
    if (!title) {
      setMessage("请先给纪念品起一个名字。");
      return;
    }

    const now = new Date().toISOString();
    const souvenir: SouvenirMemory = {
      id: `souvenir_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      city,
      tripId: form.tripId || undefined,
      note: form.note.trim(),
      imageDataUrl: form.imageDataUrl || undefined,
      tags: form.tags.split(/[,，、]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 6),
      displayMode: form.displayMode,
      privacy: "private",
      capturedAt: now,
      createdAt: now,
      updatedAt: now
    };

    upsertSouvenir(souvenir);
    lightFootprintCity({
      city,
      tripId: form.tripId || undefined,
      visitedAt: now,
      source: form.tripId ? "saved_trip" : "manual",
      privacy: "private",
      note: "来自纪念品卡片"
    });
    setForm((current) => ({
      ...current,
      title: "",
      note: "",
      imageDataUrl: ""
    }));
    refresh();
    setMessage("已保存纪念品，并同步点亮城市记忆。");
  }

  function addSampleSouvenir() {
    const trip = savedTrips[0];
    const now = new Date().toISOString();
    const city = trip?.destination || "杭州";
    const souvenir: SouvenirMemory = {
      id: `souvenir_sample_${Date.now().toString(36)}`,
      title: `${city} 小票与贴纸`,
      city,
      tripId: trip?.id,
      note: "一张可以分享的轻量纪念品卡片，后续可替换为抠图或 3D 展示。",
      imageDataUrl: createSampleSouvenirImage(city),
      tags: ["票根", "贴纸", "城市记忆"],
      displayMode: "layered",
      privacy: "private",
      capturedAt: now,
      createdAt: now,
      updatedAt: now
    };
    upsertSouvenir(souvenir);
    lightFootprintCity({
      city,
      tripId: trip?.id,
      visitedAt: now,
      source: trip ? "saved_trip" : "manual",
      privacy: "private",
      note: "来自纪念品样例"
    });
    refresh();
    setMessage("已创建示例纪念品。");
  }

  async function createShareCard(souvenir: SouvenirMemory) {
    const shareImageDataUrl = await renderSouvenirShareCard(souvenir);
    upsertSouvenir({
      ...souvenir,
      shareImageDataUrl
    });
    refresh();
    setMessage(`已生成「${souvenir.title}」分享卡片。`);
  }

  function removeSouvenir(souvenirId: string) {
    deleteSouvenir(souvenirId);
    refresh();
    setMessage("纪念品已删除。");
  }

  return (
    <main className="app-shell souvenir-page">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-two" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span>Souvenirs</span>
      </header>

      <section className="souvenir-hero glass-card">
        <div>
          <p className="eyebrow">Pocket Memory</p>
          <h1>纪念品盒</h1>
          <p>把票根、贴纸、贝壳或小物拍成卡片，先以本地纪念品沉淀，之后再探索抠图、2.5D 或 3D 展示。</p>
        </div>
        <div className="souvenir-hero-stats">
          <span>{souvenirs.length} 个纪念品</span>
          <span>{reportSeed?.cityCount ?? 0} 个城市</span>
          <span>{reportSeed?.tripCount ?? 0} 条旅行</span>
        </div>
      </section>

      <section className="souvenir-layout">
        <aside className="souvenir-editor glass-card">
          <div className="section-title">
            <div>
              <p>Create</p>
              <h2>新建纪念品</h2>
            </div>
            <span>
              <PackageOpen size={22} />
            </span>
          </div>

          <label>
            <span>名称</span>
            <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
          </label>
          <div className="souvenir-form-grid">
            <label>
              <span>城市</span>
              <input value={form.city} onChange={(event) => updateForm("city", event.target.value)} />
            </label>
            <label>
              <span>关联 Trip</span>
              <select
                value={form.tripId}
                onChange={(event) => {
                  const tripId = event.target.value;
                  const trip = savedTrips.find((item) => item.id === tripId);
                  setForm((current) => ({
                    ...current,
                    tripId,
                    city: trip?.destination || current.city
                  }));
                }}
              >
                <option value="">不关联</option>
                {savedTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>小记</span>
            <textarea rows={3} value={form.note} onChange={(event) => updateForm("note", event.target.value)} />
          </label>
          <label>
            <span>标签</span>
            <input value={form.tags} onChange={(event) => updateForm("tags", event.target.value)} />
          </label>
          <div className="souvenir-mode-row">
            <button
              className={form.displayMode === "layered" ? "active" : ""}
              type="button"
              onClick={() => updateForm("displayMode", "layered")}
            >
              <Layers3 size={16} />
              2.5D 叠层
            </button>
            <button
              className={form.displayMode === "card" ? "active" : ""}
              type="button"
              onClick={() => updateForm("displayMode", "card")}
            >
              <PackageOpen size={16} />
              普通卡片
            </button>
          </div>

          <div className="souvenir-upload-row">
            <label className="primary-action souvenir-upload-action">
              <Camera size={17} />
              上传/拍照
              <input accept="image/*" capture="environment" type="file" onChange={handleImageInput} />
            </label>
            <button className="secondary-action" type="button" onClick={addSampleSouvenir}>
              <Sparkles size={17} />
              示例纪念品
            </button>
          </div>

          {message && <p className="inline-success souvenir-message">{message}</p>}

          <button className="primary-action" type="button" onClick={saveSouvenir}>
            <ImagePlus size={17} />
            保存纪念品
          </button>
        </aside>

        <section className="souvenir-preview-panel glass-card">
          <div className="section-title">
            <div>
              <p>Preview</p>
              <h2>分享卡片预览</h2>
            </div>
            <span>
              <Share2 size={22} />
            </span>
          </div>
          <SouvenirCard
            souvenir={{
              id: "preview",
              title: form.title || "未命名纪念品",
              city: form.city || "城市",
              tripId: form.tripId || undefined,
              note: form.note,
              imageDataUrl: form.imageDataUrl || undefined,
              tags: form.tags.split(/[,，、]/).map((tag) => tag.trim()).filter(Boolean),
              displayMode: form.displayMode,
              privacy: "private",
              capturedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
          />

          <div className="annual-report-panel">
            <div>
              <p className="eyebrow">Annual Report Seed</p>
              <h3>{reportSeed?.year ?? new Date().getFullYear()} 年度报告数据底座</h3>
            </div>
            <div className="annual-report-grid">
              <span>{reportSeed?.tripCount ?? 0} 条旅行</span>
              <span>{reportSeed?.cityCount ?? 0} 个城市</span>
              <span>{reportSeed?.souvenirCount ?? 0} 个纪念品</span>
              <span>{reportSeed?.photoMemoryCount ?? 0} 组相册记忆</span>
            </div>
            <div className="annual-report-tags">
              {(reportSeed?.topCities.length ? reportSeed.topCities.map((item) => `${item.city} x${item.count}`) : ["等待城市数据"]).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <button className="secondary-action" type="button" onClick={() => setReportSeed(buildAnnualReportSeed())}>
              <RefreshCcw size={16} />
              刷新年报数据
            </button>
          </div>
        </section>
      </section>

      <section className="souvenir-grid" aria-label="纪念品列表">
        {souvenirs.length === 0 ? (
          <article className="souvenir-empty glass-card">
            <PackageOpen size={30} />
            <h2>还没有纪念品</h2>
            <p>先拍一张票根、小物或贴纸，Roamory 会把它放进本地纪念品盒。</p>
          </article>
        ) : (
          souvenirs.map((souvenir) => (
            <article className="souvenir-list-card glass-card" key={souvenir.id}>
              <SouvenirCard souvenir={souvenir} />
              <div className="souvenir-card-actions">
                <button className="primary-action" type="button" onClick={() => createShareCard(souvenir)}>
                  <Share2 size={16} />
                  生成分享卡片
                </button>
                {souvenir.shareImageDataUrl && (
                  <a className="secondary-action action-link" download={`${souvenir.title}.png`} href={souvenir.shareImageDataUrl}>
                    保存图片
                  </a>
                )}
                <button className="icon-button" type="button" onClick={() => removeSouvenir(souvenir.id)} aria-label="删除纪念品">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function SouvenirCard({ souvenir }: { souvenir: SouvenirMemory }) {
  const layered = souvenir.displayMode === "layered";
  return (
    <div className={layered ? "souvenir-card souvenir-card-layered" : "souvenir-card"}>
      <div className="souvenir-image-frame">
        {souvenir.imageDataUrl ? (
          <img src={souvenir.imageDataUrl} alt="" />
        ) : (
          <div className="souvenir-image-placeholder">
            <PackageOpen size={28} />
          </div>
        )}
      </div>
      <div className="souvenir-card-copy">
        <span>
          <MapPinned size={14} />
          {souvenir.city}
        </span>
        <h2>{souvenir.title}</h2>
        <p>{souvenir.note || "一件还没写下故事的小纪念品。"}</p>
        <div className="souvenir-tag-row">
          {souvenir.tags.slice(0, 4).map((tag) => (
            <small key={tag}>{tag}</small>
          ))}
        </div>
        <time>
          <CalendarDays size={14} />
          {formatDate(souvenir.capturedAt)}
        </time>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(date);
}

async function resizeSouvenirImage(file: File): Promise<string> {
  const source = await readFileAsDataUrl(file);
  return resizeImageDataUrl(source, 680);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(source: string, maxSide: number): Promise<string> {
  return new Promise((resolve) => {
    if (!source) {
      resolve("");
      return;
    }
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      } catch {
        resolve(source);
      }
    };
    image.onerror = () => resolve(source);
    image.src = source;
  });
}

function createSampleSouvenirImage(city: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="680" height="520" viewBox="0 0 680 520">
      <rect width="680" height="520" rx="32" fill="#d9f1fb"/>
      <path d="M74 134h532v252H74z" fill="#fffdf4" stroke="#7dc9e6" stroke-width="8"/>
      <path d="M92 176h496M92 244h496M92 312h496" stroke="#b8d7e6" stroke-width="4" stroke-dasharray="18 18"/>
      <circle cx="534" cy="116" r="56" fill="#f6eedb" stroke="#4f7484" stroke-width="5"/>
      <text x="122" y="234" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#4f7484">${city}</text>
      <text x="124" y="302" font-family="Arial, sans-serif" font-size="28" fill="#4f7484">souvenir ticket</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function renderSouvenirShareCard(souvenir: SouvenirMemory) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#c7edfb");
  gradient.addColorStop(0.55, "#f8fcff");
  gradient.addColorStop(1, "#d9f1fb");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255,255,255,.74)";
  context.fillRect(78, 70, 744, 1060);
  context.fillStyle = "#4f7484";
  context.font = "700 30px Arial";
  context.fillText("Roamory Souvenir", 118, 138);
  context.font = "800 72px Arial";
  context.fillText(souvenir.city, 118, 228);

  if (souvenir.imageDataUrl) {
    const image = await loadImage(souvenir.imageDataUrl).catch(() => null);
    if (image) {
      context.drawImage(image, 118, 280, 664, 470);
    }
  } else {
    context.fillStyle = "#d9f1fb";
    context.fillRect(118, 280, 664, 470);
  }

  context.fillStyle = "#243d4a";
  context.font = "800 52px Arial";
  drawWrappedText(context, souvenir.title, 118, 835, 660, 58, 2);
  context.fillStyle = "#4f7484";
  context.font = "600 28px Arial";
  drawWrappedText(context, souvenir.note || "一件旅行小物。", 118, 940, 660, 38, 3);
  context.fillStyle = "#7dc9e6";
  context.font = "700 24px Arial";
  context.fillText(souvenir.tags.slice(0, 4).join("  /  "), 118, 1092);

  return canvas.toDataURL("image/png");
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = Array.from(text);
  let line = "";
  let lineCount = 0;
  words.forEach((word) => {
    const testLine = `${line}${word}`;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
    } else {
      line = testLine;
    }
  });
  if (line && lineCount < maxLines) context.fillText(line, x, y + lineCount * lineHeight);
}
