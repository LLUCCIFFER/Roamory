"use client";

import { ArrowLeft, CalendarDays, Eye, EyeOff, MapPinned, PackageOpen, Route } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  readFootprintCity,
  readSavedTrips,
  readSouvenirsByCity,
  toggleFootprintPrivacy
} from "../../../lib/storage";
import type { FootprintCity, SavedTrip, SouvenirMemory } from "../../../lib/storage";

function decodeCityParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return "";
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

function sameCity(left: string, right: string) {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export default function FootprintCityPage() {
  const params = useParams<{ city: string }>();
  const city = useMemo(() => decodeCityParam(params.city), [params.city]);
  const [footprint, setFootprint] = useState<FootprintCity | null>(null);
  const [linkedTrips, setLinkedTrips] = useState<SavedTrip[]>([]);
  const [citySouvenirs, setCitySouvenirs] = useState<SouvenirMemory[]>([]);

  useEffect(() => {
    const currentFootprint = readFootprintCity(city);
    const trips = readSavedTrips().filter(
      (trip) => currentFootprint?.tripIds.includes(trip.id) || sameCity(trip.destination, city)
    );
    setFootprint(currentFootprint);
    setLinkedTrips(trips);
    setCitySouvenirs(readSouvenirsByCity(city));
  }, [city]);

  function handleTogglePrivacy() {
    if (!footprint) return;
    const nextFootprint = toggleFootprintPrivacy(footprint.city);
    if (nextFootprint) setFootprint(nextFootprint);
  }

  const hasCityMemory = Boolean(footprint) || citySouvenirs.length > 0;
  const displayCity = footprint?.city || city;

  return (
    <main className="app-shell subpage-shell city-detail-shell">
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
        <span>Footprint City</span>
      </header>

      <section className="city-hero glass-card">
        <div>
          <p className="eyebrow">Virtual Space</p>
          <h1>{city || "城市"} 记忆空间</h1>
          <p>
            {hasCityMemory
              ? "这里汇总本地保存过的行程、手动点亮记录和纪念品。"
              : "这个城市还没有被点亮，回到首页足迹空间后可以手动点亮。"}
          </p>
        </div>
        {footprint && (
          <button className="secondary-action" type="button" onClick={handleTogglePrivacy}>
            {footprint.privacy === "public" ? <Eye size={17} /> : <EyeOff size={17} />}
            {footprint.privacy === "public" ? "公开中" : "私密中"}
          </button>
        )}
      </section>

      {hasCityMemory ? (
        <section className="city-detail-layout">
          <article className="city-memory-map glass-card">
            <MapPinned size={34} />
            <div>
              <span className="footprint-pin large" />
              <h2>{displayCity}</h2>
              <p>{footprint?.note || "这座城市已进入你的本地旅行日记。"}</p>
            </div>
            <div className="city-stat-grid">
              <span>
                <strong>{footprint?.visitCount ?? 0}</strong>
                次点亮
              </span>
              <span>
                <strong>{linkedTrips.length}</strong>
                条行程
              </span>
              <span>
                <strong>{formatDate(footprint?.lastVisitedAt ?? citySouvenirs[0]?.capturedAt)}</strong>
                最近到访
              </span>
            </div>
          </article>

          <aside className="linked-trip-panel glass-card">
            <div className="section-title">
              <div>
                <p>Linked Trips</p>
                <h2>关联 Trip</h2>
              </div>
              <span>{linkedTrips.length}</span>
            </div>
            {linkedTrips.length === 0 ? (
              <p className="city-empty-copy">还没有保存到这个城市的行程，之后保存 Trip 会自动挂到这里。</p>
            ) : (
              <div className="linked-trip-list">
                {linkedTrips.map((trip) => (
                  <Link className="linked-trip-item" href={`/trips/${trip.id}`} key={trip.id}>
                    <strong>{trip.title}</strong>
                    <span>
                      <CalendarDays size={15} />
                      {trip.startDate} · {trip.days.length} 天
                    </span>
                    <span>
                      <Route size={15} />
                      {trip.days.reduce((count, day) => count + day.stops.length, 0)} 个点位
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </aside>

          <aside className="city-souvenir-panel glass-card">
            <div className="section-title">
              <div>
                <p>Souvenirs</p>
                <h2>城市纪念品</h2>
              </div>
              <span>{citySouvenirs.length}</span>
            </div>
            {citySouvenirs.length === 0 ? (
              <p className="city-empty-copy">还没有挂到这个城市的纪念品。</p>
            ) : (
              <div className="city-souvenir-list">
                {citySouvenirs.map((souvenir) => (
                  <Link className="city-souvenir-item" href="/souvenirs" key={souvenir.id}>
                    {souvenir.imageDataUrl ? (
                      <img src={souvenir.imageDataUrl} alt="" />
                    ) : (
                      <PackageOpen size={24} />
                    )}
                    <div>
                      <strong>{souvenir.title}</strong>
                      <span>{souvenir.tags.slice(0, 3).join(" / ") || "纪念品"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </section>
      ) : (
        <section className="city-empty-state glass-card">
          <MapPinned size={34} />
          <h2>还没有足迹</h2>
          <p>先在首页足迹空间输入城市名，或保存一个 planned 行程。</p>
          <Link className="primary-action action-link" href="/">
            回到足迹空间
          </Link>
        </section>
      )}
    </main>
  );
}
