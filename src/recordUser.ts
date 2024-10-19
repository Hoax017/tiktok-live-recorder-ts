import { path, writableStreamFromWriter } from "./deps.ts";

export default async function recordUser(
  user: string,
  recording: Recording,
  output?: string,
) {
  const roomId = await getRoomId(user);
  if (!roomId) {
    console.error(`could not get roomId for ${user}`);
    return;
  }
  const url = await getLiveUrl(roomId);
  if (!url) {
    console.error(`could not get live url for ${user}`);
    return;
  }
  const isLive = await isUserInLive(roomId);
  if (!isLive) {
    console.log(`${user} is offline`);
    return;
  }

  let fileResponse = null;
  try {
    fileResponse = await fetch(url);
  } catch (e) {
    console.error(`could not fetch ${url}`, e);
    return;
  }

  if (fileResponse?.body) {
    recording[user] = true;
    console.log(`Started recording ${user}...`);

    const file = await Deno.open(filename(user, output), {
      write: true,
      create: true,
    }).catch(
      (e) => {
        console.error("could not open output dir to write", e);
        Deno.exit();
      },
    );
    const writableStream = writableStreamFromWriter(file);
    await fileResponse.body.pipeTo(writableStream);
    recording[user] = false;
    console.log(`${user}'s stream ended`);
  }
}

async function getRoomId(user: string): Promise<string | undefined> {
  return await fetch(`https://www.tiktok.com/@${user}/live`)
    .then((res) => res.text())
    .then((text) => {
      return text.match(/"roomId":"(\d+)"/)?.[1];
    });
}

async function isUserInLive(roomId: string): Promise<boolean | undefined> {
  return await fetch(
    `https://www.tiktok.com/api/live/detail/?aid=1988&roomID=${roomId}`,
  )
    .then((res) => res.json())
    .then((json) => json.LiveRoomInfo?.status != 4);
}

async function getLiveUrl(roomId: string): Promise<string | undefined> {
  return await fetch(
    `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=${roomId}`,
  )
    .then((res) => res.json())
    .then((json) => json.data?.stream_url?.rtmp_pull_url);
}

function filename(user: string, output?: string): string {
  const date = new Date();
  // format: user_Y_m_d_time.flv
  const day = date.toISOString().split("T")[0].replace(/-/g, "_");
  const time = date.getTime();
  const file = `${user}_${day}_${time}.flv`;
  return output ? path.join(output, file) : file;
}
