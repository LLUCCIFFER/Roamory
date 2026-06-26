"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MapPinned,
  RefreshCcw,
  Route,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import {
  GenerationTask,
  readGenerationTask,
  saveGenerationTask
} from "../../lib/storage";

const steps = [
  "理解旅行偏好",
  "生成 TripPlan JSON",
  "校验预算与节奏",
  "等待高德路线适配"
];

type GenerationApiResponse = {
  task?: GenerationTask;
  message?: string;
};

export default function GeneratingPage() {
  return (
    <Suspense fallback={<GeneratingFallback />}>
      <GeneratingContent />
    </Suspense>
  );
}

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const [task, setTask] = useState<GenerationTask | null>(null);
  const [progress, setProgress] = useState(12);
  const [missing, setMissing] = useState(false);
  const [serverError, setServerError] = useState("");

  const activeStep = useMemo(() => {
    if (progress < 28) return 0;
    if (progress < 56) return 1;
    if (progress < 82) return 2;
    return 3;
  }, [progress]);

  useEffect(() => {
    const storedTask = readGenerationTask();
    if (!storedTask || (taskId && storedTask.id !== taskId)) {
      setMissing(true);
      return;
    }
    const activeTask = storedTask;

    let cancelled = false;
    let pollTimer: number | undefined;
    let redirectTimer: number | undefined;

    function syncTask(nextTask: GenerationTask) {
      if (cancelled) return;
      const mergedTask: GenerationTask = {
        ...nextTask,
        draft: nextTask.draft ?? activeTask.draft
      };
      setTask(mergedTask);
      setProgress(Math.max(mergedTask.progress, 12));
      saveGenerationTask(mergedTask);

      if (mergedTask.status === "failed") {
        setServerError(mergedTask.errorMessage || "生成任务失败，请重试。");
      }

      if (mergedTask.status === "succeeded" && mergedTask.tripId) {
        if (pollTimer) window.clearInterval(pollTimer);
        redirectTimer = window.setTimeout(() => router.push(`/trips/${mergedTask.tripId}`), 520);
      }
    }

    async function ensureGenerationJob() {
      const response = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: activeTask.draft })
      });
      const payload = (await response.json()) as GenerationApiResponse;

      if (payload.task) {
        syncTask(payload.task);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message || "生成任务创建失败。");
      }
    }

    async function pollGenerationJob() {
      const response = await fetch(`/api/trips/generate/${encodeURIComponent(activeTask.id)}`, {
        cache: "no-store"
      });

      if (response.status === 404) {
        await ensureGenerationJob();
        return;
      }

      const payload = (await response.json()) as GenerationApiResponse;
      if (!response.ok || !payload.task) {
        throw new Error(payload.message || "生成任务状态读取失败。");
      }

      syncTask(payload.task);
    }

    async function startPolling() {
      try {
        setServerError("");
        syncTask({
          ...activeTask,
          status: "processing",
          progress: Math.max(activeTask.progress, 12),
          updatedAt: new Date().toISOString()
        });
        await ensureGenerationJob();
        await pollGenerationJob();
        pollTimer = window.setInterval(() => {
          pollGenerationJob().catch((error: unknown) => {
            setServerError(error instanceof Error ? error.message : "生成任务状态读取失败。");
            if (pollTimer) window.clearInterval(pollTimer);
          });
        }, 700);
      } catch (error) {
        if (!cancelled) {
          setServerError(error instanceof Error ? error.message : "生成任务创建失败。");
        }
      }
    }

    startPolling();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearInterval(pollTimer);
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router, taskId]);

  if (missing) {
    return (
      <GeneratingShell>
        <section className="generation-card glass-card empty-state">
          <Sparkles size={34} />
          <h1>没有找到正在生成的草稿</h1>
          <p>当前游客任务只保存在本地浏览器里。可以回到填写页重新生成一份行程。</p>
          <Link className="primary-action action-link" href="/create">
            重新填写
          </Link>
        </section>
      </GeneratingShell>
    );
  }

  if (serverError || task?.status === "failed") {
    return (
      <GeneratingShell>
        <section className="generation-card glass-card empty-state">
          <AlertCircle size={34} />
          <h1>生成没有完成</h1>
          <p>{serverError || task?.errorMessage || "当前任务暂时不可用，可以重新尝试生成。"}</p>
          <div className="generation-retry-row">
            <button className="primary-action" type="button" onClick={() => window.location.reload()}>
              <RefreshCcw size={18} />
              重试生成
            </button>
            <Link className="secondary-action action-link" href="/create">
              修改需求
            </Link>
          </div>
        </section>
      </GeneratingShell>
    );
  }

  return (
    <GeneratingShell>
      <section className="generation-card glass-card">
        <div className="generation-orbit" aria-hidden="true">
          <LoaderCircle size={76} />
        </div>
        <p className="eyebrow">AI Structuring</p>
        <h1>{task ? `正在生成 ${task.draft.destination} 行程` : "正在准备生成任务"}</h1>
        <p>
          正在整理偏好、日程节奏、预算和路线候选，稍后会进入可编辑的旅行日记。
        </p>

        <div className="progress-track" aria-label="生成进度">
          <span className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <strong className="progress-number">{progress}%</strong>

        <ol className="generation-steps">
          {steps.map((step, index) => {
            const done = index < activeStep || progress === 100;
            const active = index === activeStep && progress < 100;
            return (
              <li key={step} className={done ? "done" : active ? "active" : ""}>
                <span className="step-dot">
                  {done ? <CheckCircle2 size={16} /> : active ? <LoaderCircle size={16} /> : index + 1}
                </span>
                <span>{step}</span>
              </li>
            );
          })}
        </ol>

        <div className="generation-hints">
          <span>
            <MapPinned size={16} />
            高德路线校准
          </span>
          <span>
            <Route size={16} />
            本地草稿已保存
          </span>
        </div>
      </section>
    </GeneratingShell>
  );
}

function GeneratingShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell subpage-shell generating-shell">
      <div className="watercolor-bg" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="flower flower-two" />
      </div>

      <header className="page-topbar">
        <Link className="back-link" href="/create">
          <ArrowLeft size={18} />
          修改需求
        </Link>
        <span>Generating</span>
      </header>
      {children}
    </main>
  );
}

function GeneratingFallback() {
  return (
    <main className="app-shell subpage-shell generating-shell">
      <section className="generation-card glass-card">
        <div className="generation-orbit" aria-hidden="true">
          <LoaderCircle size={76} />
        </div>
        <h1>正在载入任务</h1>
      </section>
    </main>
  );
}
