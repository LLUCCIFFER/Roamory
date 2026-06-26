import { NextResponse } from "next/server";

import {
  getGenerationJob,
  toGenerationJobResponse
} from "../../../../../lib/server/generation-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const job = getGenerationJob(taskId);

  if (!job) {
    return NextResponse.json(
      {
        errorCode: "TASK_NOT_FOUND",
        message: "没有找到对应的生成任务。"
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    task: toGenerationJobResponse(job)
  });
}
