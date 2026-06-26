"use client";

import {
  ArrowLeft,
  CalendarDays,
  MapPinned,
  Plane,
  Route,
  Sparkles,
  UsersRound,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  CompanionType,
  createQueuedTask,
  GuestDraft,
  makeTaskId,
  saveGenerationTask,
  saveGuestDraft,
  TravelPace
} from "../../lib/storage";

type CreateFormState = {
  destination: string;
  departureCity: string;
  startDate: string;
  days: number;
  mood: string;
  budget: string;
  interests: string[];
  companionType: CompanionType;
  pace: TravelPace;
  transportModes: string[];
  mustVisit: string;
  avoid: string;
  freeText: string;
};

const interestOptions = ["拍照", "美食", "寺庙", "咖啡", "自然风光", "亲子", "博物馆", "夜景"];
const transportOptions = [
  { label: "公共交通", value: "public_transport" },
  { label: "步行优先", value: "walking" },
  { label: "打车", value: "taxi" },
  { label: "自驾", value: "driving" }
];
const companionOptions: Array<{ label: string; value: CompanionType }> = [
  { label: "一个人", value: "solo" },
  { label: "情侣", value: "couple" },
  { label: "朋友", value: "friends" },
  { label: "家庭", value: "family" }
];
const paceOptions: Array<{ label: string; value: TravelPace }> = [
  { label: "松弛", value: "relaxed" },
  { label: "均衡", value: "balanced" },
  { label: "紧凑", value: "intense" }
];

const initialForm: CreateFormState = {
  destination: "杭州",
  departureCity: "上海",
  startDate: "2026-10-02",
  days: 3,
  mood: "Summer",
  budget: "2000",
  interests: ["拍照", "美食", "咖啡"],
  companionType: "friends",
  pace: "balanced",
  transportModes: ["public_transport", "walking"],
  mustVisit: "西湖、灵隐寺、龙井村",
  avoid: "过度赶路、太商业化的景点",
  freeText: "希望每天留一点慢慢散步和拍照的时间，晚上不要安排太满。"
};

export default function CreateTripPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateFormState>(initialForm);
  const [error, setError] = useState("");

  const selectedCount = useMemo(
    () => form.interests.length + form.transportModes.length,
    [form.interests.length, form.transportModes.length]
  );

  function updateField<K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key: "interests" | "transportModes", value: string) {
    setForm((current) => {
      const values = current[key];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
      return { ...current, [key]: nextValues };
    });
  }

  function submitDraft(event?: FormEvent<HTMLFormElement>, quickState?: CreateFormState) {
    event?.preventDefault();
    const nextState = quickState ?? form;
    const destination = nextState.destination.trim();

    if (!destination) {
      setError("请先填写目的地。");
      return;
    }

    if (nextState.days < 1 || nextState.days > 9) {
      setError("当前原型支持 1 到 9 天的行程。");
      return;
    }

    const taskId = makeTaskId();
    const draft: GuestDraft = {
      ...nextState,
      taskId,
      destination,
      savedAt: new Date().toISOString()
    };

    saveGuestDraft(draft);
    saveGenerationTask(createQueuedTask(draft));
    router.push(`/generating?taskId=${taskId}`);
  }

  return (
    <main className="app-shell subpage-shell">
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
        <span>Guest Draft</span>
      </header>

      <section className="create-layout">
        <aside className="create-aside glass-card">
          <p className="eyebrow">Create Trip</p>
          <h1>把想去的地方写成旅行日记</h1>
          <p>
            先把目的地、预算和节奏写清楚，Roamory 会把它整理成一份可保存、可分享的旅行日记。
          </p>
          <div className="aside-stats">
            <span>
              <MapPinned size={16} />
              高德路线校准
            </span>
            <span>
              <Sparkles size={16} />
              {selectedCount} 个偏好
            </span>
          </div>
        </aside>

        <form className="form-card glass-card" onSubmit={submitDraft}>
          <section className="form-section">
            <div className="form-section-title">
              <Plane size={18} />
              <h2>基础信息</h2>
            </div>
            <div className="form-grid two">
              <label>
                <span>目的地</span>
                <input
                  value={form.destination}
                  onChange={(event) => updateField("destination", event.target.value)}
                  placeholder="想去哪里"
                />
              </label>
              <label>
                <span>出发城市</span>
                <input
                  value={form.departureCity}
                  onChange={(event) => updateField("departureCity", event.target.value)}
                  placeholder="从哪里出发"
                />
              </label>
              <label>
                <span>开始日期</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                />
              </label>
              <label>
                <span>天数</span>
                <input
                  min={1}
                  max={9}
                  type="number"
                  value={form.days}
                  onChange={(event) => updateField("days", Number(event.target.value))}
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <Wallet size={18} />
              <h2>预算与节奏</h2>
            </div>
            <div className="form-grid two">
              <label>
                <span>预算 CNY</span>
                <input
                  inputMode="numeric"
                  value={form.budget}
                  onChange={(event) => updateField("budget", event.target.value)}
                  placeholder="2000"
                />
              </label>
              <label>
                <span>旅行氛围</span>
                <select value={form.mood} onChange={(event) => updateField("mood", event.target.value)}>
                  <option>Summer</option>
                  <option>Weekend</option>
                  <option>Sunset</option>
                  <option>Rainy</option>
                </select>
              </label>
            </div>
            <div className="segmented-options" aria-label="出行人群">
              {companionOptions.map((item) => (
                <button
                  key={item.value}
                  className={form.companionType === item.value ? "active" : ""}
                  type="button"
                  onClick={() => updateField("companionType", item.value)}
                >
                  <UsersRound size={15} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="segmented-options" aria-label="行程节奏">
              {paceOptions.map((item) => (
                <button
                  key={item.value}
                  className={form.pace === item.value ? "active" : ""}
                  type="button"
                  onClick={() => updateField("pace", item.value)}
                >
                  <Route size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <CalendarDays size={18} />
              <h2>偏好与约束</h2>
            </div>
            <div className="toggle-grid">
              {interestOptions.map((item) => (
                <button
                  key={item}
                  className={form.interests.includes(item) ? "toggle-chip active" : "toggle-chip"}
                  type="button"
                  onClick={() => toggleArray("interests", item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="toggle-grid">
              {transportOptions.map((item) => (
                <button
                  key={item.value}
                  className={form.transportModes.includes(item.value) ? "toggle-chip active" : "toggle-chip"}
                  type="button"
                  onClick={() => toggleArray("transportModes", item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="form-grid two">
              <label>
                <span>一定想去</span>
                <textarea
                  value={form.mustVisit}
                  onChange={(event) => updateField("mustVisit", event.target.value)}
                  rows={3}
                />
              </label>
              <label>
                <span>尽量避开</span>
                <textarea
                  value={form.avoid}
                  onChange={(event) => updateField("avoid", event.target.value)}
                  rows={3}
                />
              </label>
            </div>
            <label>
              <span>补充说明</span>
              <textarea
                value={form.freeText}
                onChange={(event) => updateField("freeText", event.target.value)}
                rows={4}
              />
            </label>
          </section>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="secondary-action" type="button" onClick={() => submitDraft(undefined, initialForm)}>
              使用示例需求
            </button>
            <button className="primary-action" type="submit">
              <Sparkles size={18} />
              生成行程
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
