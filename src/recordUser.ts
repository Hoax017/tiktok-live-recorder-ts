import { ffmpeg, path, writableStreamFromWriter } from "./deps.ts";

export default async function recordUser(
  user: string,
  recording: Recording,
  convertMp4: string | boolean,
  output?: string,
  debug?: boolean,
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
    if (debug) console.log(`${user} is offline`);
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
    console.log(`Started recording ${user}...`);
    recording[user] = filename(user, output);

    // open flv file to write
    const file = await Deno.open(recording[user], {
      write: true,
      create: true,
    }).catch(
      (e) => {
        console.error("could not open output dir to write", e);
        Deno.exit();
      },
    );
    const writableStream = writableStreamFromWriter(file);

    // handle SIGINT
    let aborted = false;
    const controller = new AbortController();
    const { signal } = controller;
    const signalHandler = () => {
      aborted = true;
      controller.abort();
    };
    Deno.addSignalListener("SIGINT", signalHandler);

    try {
      // pipe response live to flv file
      await fileResponse.body.pipeTo(writableStream, { signal });
    } catch (e) {
      Deno.removeSignalListener("SIGINT", signalHandler);
      if (e instanceof Error && e.name === "AbortError") {
        console.log(`Recording ${user} was aborted`);
      } else {
        throw e;
      }
    }

    if (convertMp4) {
      console.log(`Stopped recording ${user}, converting to mp4...`);
      await convertFlvToMp4(
        convertMp4,
        recording[user],
        recording[user].replace(/flv$/, "mp4"),
      );
    }
    recording[user] = null;
    console.log(`${user}'s stream ended`);
    if (aborted && !Object.values(recording).some((r) => r)) {
      Deno.exit();
    }
  }
}

async function convertFlvToMp4(
  convertMp4: string | boolean,
  input: string,
  output: string,
) {
  const binary = await getFfmpegPath(convertMp4);
  if (!binary) {
    return;
  }
  const videoRender = ffmpeg({ input, ffmpegDir: binary });
  await videoRender.videoBitrate("1000k").save(output);

  console.log(`Conversion complete: ${output}`);
  console.log(`Removing flv file: ${input}`);
  await Deno.remove(input);
}

async function getFfmpegPath(
  convertMp4: string | boolean,
): Promise<string | null> {
  if (typeof convertMp4 !== "boolean") {
    return convertMp4;
  }
  const process = new Deno.Command("which", { args: ["ffmpeg"] });
  const { stdout, success } = await process.output();
  if (!success) {
    console.error(
      "ffmpeg not found in PATH try providing the path manually with -c [path]",
    );
    return null;
  }
  const path = new TextDecoder().decode(stdout);
  return path.trim();
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
