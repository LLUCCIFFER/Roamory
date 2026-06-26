"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Database,
  Eye,
  EyeOff,
  Link2,
  LockKeyhole,
  MapPinned,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
  X,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  clearRoamoryLocalData,
  clearUserProfile,
  defaultPreferenceSettings,
  defaultPrivacySettings,
  deleteFootprintCity,
  deleteSavedTrip,
  deleteSharePosterDraft,
  readFootprints,
  readPreferenceSettings,
  readPrivacySettings,
  readSavedTrips,
  readSharePosterDrafts,
  readUserProfile,
  savePreferenceSettings,
  savePrivacySettings,
  saveUserProfile
} from "../../lib/storage";
import type {
  FootprintCity,
  PreferenceSettings,
  PrivacySettings,
  SavedTrip,
  SharePosterDraft,
  UserProfile
} from "../../lib/storage";

type SettingsPanel = "account" | "preferences" | "privacy" | "data";

const panelItems: Array<{
  id: SettingsPanel;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "account", label: "账号", icon: UserRound },
  { id: "preferences", label: "偏好", icon: Settings2 },
  { id: "privacy", label: "隐私", icon: ShieldCheck },
  { id: "data", label: "数据", icon: Database }
];

const interestOptions = ["拍照", "美食", "慢游", "海边", "博物馆", "亲子", "徒步", "夜景"];

const paceLabels = {
  relaxed: "松弛",
  balanced: "均衡",
  intense: "紧凑"
};

const companionLabels = {
  solo: "独自",
  couple: "情侣",
  friends: "朋友",
  family: "家庭"
};

function isSettingsPanel(value: string): value is SettingsPanel {
  return panelItems.some((item) => item.id === value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>("account");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState({ displayName: "Roamory 旅人", email: "" });
  const [preferences, setPreferences] = useState<PreferenceSettings>(() => defaultPreferenceSettings());
  const [privacy, setPrivacy] = useState<PrivacySettings>(() => defaultPrivacySettings());
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [footprints, setFootprints] = useState<FootprintCity[]>([]);
  const [posters, setPosters] = useState<SharePosterDraft[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState("");

  const savedTripMap = useMemo(
    () => new Map(savedTrips.map((trip) => [trip.id, trip])),
    [savedTrips]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const panel = params.get("panel");
    if (panel && isSettingsPanel(panel)) setActivePanel(panel);
    if (params.get("login") === "1") setShowLoginModal(true);
    refreshLocalData();
  }, []);

  function refreshLocalData() {
    const nextProfile = readUserProfile();
    setProfile(nextProfile);
    setProfileDraft({
      displayName: nextProfile?.displayName ?? "Roamory 旅人",
      email: nextProfile?.email ?? ""
    });
    setPreferences(readPreferenceSettings());
    setPrivacy(readPrivacySettings());
    setSavedTrips(readSavedTrips());
    setFootprints(readFootprints());
    setPosters(readSharePosterDrafts());
  }

  function saveProfile() {
    const displayName = profileDraft.displayName.trim();
    const email = profileDraft.email.trim();
    if (!displayName || !email.includes("@")) {
      setMessage("请输入昵称和有效邮箱。");
      return;
    }

    const nextProfile = saveUserProfile({
      displayName,
      email,
      syncStatus: "linked"
    });
    setProfile(nextProfile);
    setShowLoginModal(false);
    setMessage("账号已绑定到本地资料；后续同步会复用这份身份。");
  }

  function unlinkProfile() {
    clearUserProfile();
    setProfile(null);
    setProfileDraft({ displayName: "Roamory 旅人", email: "" });
    setMessage("已回到游客模式，本地旅行数据仍保留。");
  }

  function updatePreference<K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) {
    setPreferences((current) => ({
      ...current,
      [key]: value
    }));
  }

  function toggleInterest(interest: string) {
    setPreferences((current) => {
      const hasInterest = current.interests.includes(interest);
      return {
        ...current,
        interests: hasInterest
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest]
      };
    });
  }

  function savePreferences() {
    const nextPreferences = savePreferenceSettings(preferences);
    setPreferences(nextPreferences);
    setMessage("偏好设置已保存，会作为后续生成的默认值。");
  }

  function updatePrivacy<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    setPrivacy((current) => ({
      ...current,
      [key]: value
    }));
  }

  function savePrivacy() {
    const nextPrivacy = savePrivacySettings(privacy);
    setPrivacy(nextPrivacy);
    setMessage("隐私默认值已保存，新建分享海报会优先读取这些开关。");
  }

  async function closePosterPublicLink(draft: SharePosterDraft) {
    if (!draft.publicToken) return;
    await fetch(`/api/share-links/${draft.publicToken}`, {
      method: "DELETE"
    }).catch(() => undefined);
  }

  async function removeTrip(tripId: string) {
    const poster = posters.find((draft) => draft.tripId === tripId);
    if (poster) await closePosterPublicLink(poster);
    deleteSavedTrip(tripId);
    refreshLocalData();
    setMessage("旅行、缩略图和本地海报草稿已删除。");
  }

  function removeFootprint(city: string) {
    deleteFootprintCity(city);
    refreshLocalData();
    setMessage(`${city} 足迹已删除。`);
  }

  async function removePoster(draft: SharePosterDraft) {
    await closePosterPublicLink(draft);
    deleteSharePosterDraft(draft.tripId);
    refreshLocalData();
    setMessage("分享海报草稿已删除；如曾有公开链接，也已尝试关闭。");
  }

  async function clearAllData() {
    const ok = window.confirm("确认清空 Roamory 本地数据？这会删除游客草稿、旅行、足迹、海报和账号占位。");
    if (!ok) return;
    await Promise.all(posters.map((draft) => closePosterPublicLink(draft)));
    clearRoamoryLocalData();
    refreshLocalData();
    setMessage("本地数据已清空。");
  }

  return (
    <main className="app-shell subpage-shell settings-shell">
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
        <span>Settings</span>
      </header>

      <section className="settings-hero glass-card">
        <div>
          <p className="eyebrow">Local First</p>
          <h1>账号、隐私与本地数据</h1>
          <p>游客可直接保存，本页负责绑定账号占位、默认偏好、公开内容开关和本地数据删除。</p>
        </div>
        <span className={profile ? "settings-status linked" : "settings-status"}>
          {profile ? <BadgeCheck size={17} /> : <LockKeyhole size={17} />}
          {profile ? "已绑定本地身份" : "游客模式"}
        </span>
      </section>

      <section className="settings-layout">
        <nav className="settings-tabs glass-card" aria-label="设置分区">
          {panelItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activePanel === item.id ? "active" : ""}
                key={item.id}
                type="button"
                onClick={() => setActivePanel(item.id)}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="settings-panel glass-card">
          {message && <p className="inline-success settings-message">{message}</p>}

          {activePanel === "account" && (
            <div className="settings-section">
              <div className="section-title">
                <div>
                  <p>Account</p>
                  <h2>游客与账号绑定</h2>
                </div>
                <span>
                  <UserRound size={22} />
                </span>
              </div>

              <div className="account-summary">
                <div className="account-avatar">
                  <UserRound size={28} />
                </div>
                <div>
                  <strong>{profile?.displayName ?? "游客旅人"}</strong>
                  <span>{profile?.email ?? "本地保存，不跨端同步"}</span>
                </div>
              </div>

              <div className="settings-action-row">
                <button className="primary-action" type="button" onClick={() => setShowLoginModal(true)}>
                  <Link2 size={17} />
                  {profile ? "更新绑定" : "绑定账号"}
                </button>
                {profile && (
                  <button className="secondary-action" type="button" onClick={unlinkProfile}>
                    <X size={17} />
                    回到游客模式
                  </button>
                )}
              </div>
            </div>
          )}

          {activePanel === "preferences" && (
            <div className="settings-section">
              <div className="section-title">
                <div>
                  <p>Preferences</p>
                  <h2>生成偏好</h2>
                </div>
                <span>
                  <Settings2 size={22} />
                </span>
              </div>

              <div className="settings-form-grid">
                <label>
                  <span>默认出发城市</span>
                  <input
                    value={preferences.departureCity}
                    onChange={(event) => updatePreference("departureCity", event.target.value)}
                  />
                </label>
                <label>
                  <span>默认预算</span>
                  <input
                    inputMode="numeric"
                    value={preferences.budget}
                    onChange={(event) => updatePreference("budget", event.target.value)}
                  />
                </label>
              </div>

              <div className="settings-choice-block">
                <span>旅行节奏</span>
                <div className="segmented-options">
                  {Object.entries(paceLabels).map(([value, label]) => (
                    <button
                      className={preferences.pace === value ? "active" : ""}
                      key={value}
                      type="button"
                      onClick={() => updatePreference("pace", value as PreferenceSettings["pace"])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-choice-block">
                <span>同行人</span>
                <div className="segmented-options">
                  {Object.entries(companionLabels).map(([value, label]) => (
                    <button
                      className={preferences.companionType === value ? "active" : ""}
                      key={value}
                      type="button"
                      onClick={() => updatePreference("companionType", value as PreferenceSettings["companionType"])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-choice-block">
                <span>常用兴趣</span>
                <div className="chip-row">
                  {interestOptions.map((interest) => (
                    <button
                      className={preferences.interests.includes(interest) ? "active-chip" : ""}
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <button className="primary-action settings-save" type="button" onClick={savePreferences}>
                <Save size={17} />
                保存偏好
              </button>
            </div>
          )}

          {activePanel === "privacy" && (
            <div className="settings-section">
              <div className="section-title">
                <div>
                  <p>Privacy</p>
                  <h2>默认公开内容</h2>
                </div>
                <span>
                  <ShieldCheck size={22} />
                </span>
              </div>

              <div className="privacy-toggle-list">
                <PrivacySettingToggle
                  checked={privacy.defaultShowBudget}
                  icon={<Wallet size={17} />}
                  label="新海报默认显示预算"
                  onChange={(checked) => updatePrivacy("defaultShowBudget", checked)}
                />
                <PrivacySettingToggle
                  checked={privacy.defaultShowMap}
                  icon={<MapPinned size={17} />}
                  label="新海报默认显示地图"
                  onChange={(checked) => updatePrivacy("defaultShowMap", checked)}
                />
                <PrivacySettingToggle
                  checked={privacy.defaultShowExactLocation}
                  icon={privacy.defaultShowExactLocation ? <Eye size={17} /> : <EyeOff size={17} />}
                  label="新海报默认显示精确点位"
                  onChange={(checked) => updatePrivacy("defaultShowExactLocation", checked)}
                />
                <PrivacySettingToggle
                  checked={privacy.defaultShowExactTimes}
                  icon={<Clock3 size={17} />}
                  label="新海报默认显示具体时间"
                  onChange={(checked) => updatePrivacy("defaultShowExactTimes", checked)}
                />
                <PrivacySettingToggle
                  checked={privacy.analyticsOptIn}
                  icon={<Database size={17} />}
                  label="允许匿名产品分析"
                  onChange={(checked) => updatePrivacy("analyticsOptIn", checked)}
                />
              </div>

              <div className="settings-audit-note">
                <LockKeyhole size={17} />
                <span>日志脱敏检查：当前原型没有上传游客草稿、邮箱、预算或点位到日志；本地数据只保存在浏览器。</span>
              </div>

              <button className="primary-action settings-save" type="button" onClick={savePrivacy}>
                <Save size={17} />
                保存隐私默认值
              </button>
            </div>
          )}

          {activePanel === "data" && (
            <div className="settings-section">
              <div className="section-title">
                <div>
                  <p>Data</p>
                  <h2>本地数据管理</h2>
                </div>
                <span>
                  <Database size={22} />
                </span>
              </div>

              <div className="settings-metrics">
                <span>{savedTrips.length} 条旅行</span>
                <span>{footprints.length} 个足迹</span>
                <span>{posters.length} 份海报</span>
              </div>

              <DataList title="旅行">
                {savedTrips.length === 0 ? (
                  <EmptyDataRow label="还没有保存的旅行。" />
                ) : (
                  savedTrips.map((trip) => (
                    <div className="data-row" key={trip.id}>
                      <div>
                        <strong>{trip.title}</strong>
                        <span>{trip.destination} · {trip.status} · {trip.savedAt ? formatDateTime(trip.savedAt) : "未保存"}</span>
                      </div>
                      <button type="button" onClick={() => removeTrip(trip.id)} aria-label={`删除 ${trip.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </DataList>

              <DataList title="足迹">
                {footprints.length === 0 ? (
                  <EmptyDataRow label="还没有点亮的城市。" />
                ) : (
                  footprints.map((footprint) => (
                    <div className="data-row" key={footprint.city}>
                      <div>
                        <strong>{footprint.city}</strong>
                        <span>{footprint.visitCount} 次 · {footprint.privacy === "public" ? "公开" : "私密"}</span>
                      </div>
                      <button type="button" onClick={() => removeFootprint(footprint.city)} aria-label={`删除 ${footprint.city}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </DataList>

              <DataList title="分享海报">
                {posters.length === 0 ? (
                  <EmptyDataRow label="还没有保存的海报草稿。" />
                ) : (
                  posters.map((draft) => {
                    const trip = savedTripMap.get(draft.tripId);
                    return (
                      <div className="data-row" key={draft.tripId}>
                        <div>
                          <strong>{trip?.title ?? draft.tripId}</strong>
                          <span>{draft.template} · {draft.publicToken ? "含公开链接" : "仅本地草稿"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePoster(draft)}
                          aria-label={`删除分享海报 ${trip?.title ?? draft.tripId}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </DataList>

              <button className="secondary-action danger-action" type="button" onClick={clearAllData}>
                <Trash2 size={17} />
                清空 Roamory 本地数据
              </button>
            </div>
          )}
        </section>
      </section>

      {showLoginModal && (
        <div className="settings-modal-backdrop" role="presentation">
          <section className="settings-modal glass-card" role="dialog" aria-modal="true" aria-label="绑定账号">
            <button className="modal-close" type="button" onClick={() => setShowLoginModal(false)} aria-label="关闭">
              <X size={18} />
            </button>
            <div className="section-title">
              <div>
                <p>Link Account</p>
                <h2>绑定账号</h2>
              </div>
              <span>
                <UserRound size={22} />
              </span>
            </div>
            <label>
              <span>昵称</span>
              <input
                value={profileDraft.displayName}
                onChange={(event) => setProfileDraft((current) => ({ ...current, displayName: event.target.value }))}
              />
            </label>
            <label>
              <span>邮箱</span>
              <input
                inputMode="email"
                placeholder="you@example.com"
                value={profileDraft.email}
                onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <button className="primary-action" type="button" onClick={saveProfile}>
              <Link2 size={17} />
              保存绑定
            </button>
            <p>这是同步前的本地账号占位，不会向服务器发送邮箱。</p>
          </section>
        </div>
      )}
    </main>
  );
}

function PrivacySettingToggle({
  checked,
  icon,
  label,
  onChange
}: {
  checked: boolean;
  icon: ReactNode;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="privacy-toggle">
      <span>
        {icon}
        {label}
      </span>
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function DataList({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="data-list">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function EmptyDataRow({ label }: { label: string }) {
  return <p className="empty-data-row">{label}</p>;
}
