# Tiktok Live Recorder

Monitor and automatically record livestreams from TikTok

## Ru without installation

```
deno run --allow-net --allow-write --allow-read https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts '-u "Hoax017"'
```

## Installation

```
deno install --allow-net --allow-write --allow-read -n tlr https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts
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
    -h, --help
        Prints help information
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
