# Tiktok Live Recorder

Monitor and automatically record livestreams from TikTok

## Run without installation

```bash
deno run --allow-net --allow-write --allow-run --allow-read https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts -u "Hoax017"
```

## Installation

```bash
deno install --allow-net --allow-write --allow-run --allow-read -n tlr https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts
```

## Usage

```
    tlr [-u USER] [-w "USER1 USER2 ..."] [-i INPUT] [-o OUTPUT]

OPTIONS:
    -u, --user USER
        Record a livestream from the username
    -w, --watch "USER1 USER2 ...", -i, --input INPUT_FILE (one username per line)
        Automatic live recording when a user from the provided list is in live
    -o, --output OUTPUT
        Output directory
    -c, --convert [optional ffmpeg_path]
        Convert output flv files to mp4
    -h, --help
        Prints help information
    -d, --debug
```

## Examples

Start recording _username_'s livestream

```
tlr -u username
```

Monitor users and start recording when they start streaming

```
tlr -w "username1 username2"
```

Monitor users from a file and start recording when they start streaming

```
tlr -i lives.list
```

### Permissions

- `--allow-net` to fetch the data from TikTok
- `--allow-write` to save the video
- `--allow-run` to run `ffmpeg`
- `--allow-read` to read the input file
