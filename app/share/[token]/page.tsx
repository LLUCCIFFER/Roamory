import { ArrowLeft, Clock3, LockKeyhole, MapPinned, Route, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { mockTrip } from "../../../lib/mock-data";
import { getShareLink } from "../../../lib/server/share-store";

export const dynamic = "force-dynamic";

export default async function SharedTripPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shareLink = getShareLink(token);

  if (!shareLink || shareLink.tripId !== mockTrip.id) {
    notFound();
  }

  return (
    <main className="app-shell subpage-shell public-share-shell">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-one" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} />
          返回 Roamory
        </Link>
        <span>Public Travel Diary</span>
      </header>

      <section className="public-share-card glass-card">
        <p className="eyebrow">Shared by Roamory</p>
        <h1>{mockTrip.destination} 旅行日记</h1>
        <p>{mockTrip.summary}</p>
        <div className="public-share-meta">
          {shareLink.privacy.showBudget && (
            <span>
              <Wallet size={16} />
              CNY {mockTrip.budget}
            </span>
          )}
          <span>
            <Route size={16} />
            {mockTrip.days.reduce((count, day) => count + day.stops.length, 0)} 个点位
          </span>
          {shareLink.privacy.showMap ? (
            <span>
              <MapPinned size={16} />
              路线可见
            </span>
          ) : (
            <span>
              <LockKeyhole size={16} />
              精确地图已隐藏
            </span>
          )}
          <span>
            <LockKeyhole size={16} />
            {shareLink.privacy.showExactLocation ? "点位可见" : "精确位置已隐藏"}
          </span>
        </div>
      </section>

      <section className="public-day-grid">
        {mockTrip.days.map((day) => (
          <article key={day.day} className="day-card public-day-card">
            <header>
              <span>Day {day.day}</span>
              <strong>
                {shareLink.privacy.showExactLocation ? day.title : `${mockTrip.destination} 第 ${day.day} 日记忆`}
              </strong>
            </header>
            <ol>
              {day.stops.map((stop, index) => (
                <li key={stop.name}>
                  <span>{shareLink.privacy.showExactTimes ? stop.time : timeBucket(index)}</span>
                  <div>
                    <strong>
                      {shareLink.privacy.showExactLocation ? stop.name : `${mockTrip.destination} 城市记忆 ${index + 1}`}
                    </strong>
                    <p>{stop.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <footer>
              <Clock3 size={15} />
              {day.travelMinutes} 分钟路上时间
            </footer>
          </article>
        ))}
      </section>
    </main>
  );
}

function timeBucket(index: number) {
  if (index === 0) return "上午";
  if (index === 1) return "下午";
  return "傍晚";
}
