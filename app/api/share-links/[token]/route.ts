import { NextResponse } from "next/server";

import { disableShareLink, getShareLink } from "../../../../lib/server/share-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shareLink = getShareLink(token);

  if (!shareLink) {
    return NextResponse.json(
      {
        errorCode: "SHARE_LINK_NOT_FOUND",
        message: "公开链接不存在或已关闭。"
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ shareLink });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shareLink = disableShareLink(token);

  if (!shareLink) {
    return NextResponse.json(
      {
        errorCode: "SHARE_LINK_NOT_FOUND",
        message: "公开链接不存在或已关闭。"
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ shareLink });
}
