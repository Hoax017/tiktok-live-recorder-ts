# Tiktok Live Recorder

Monitor and automatically record livestreams from TikTok

## Ru without installation

```
deno run --allow-net --allow-write https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts '-u "Hoax017"'
```

## Installation

```
deno install --allow-net --allow-write -n tlr https://raw.githubusercontent.com/Hoax017/tiktok-live-recorder-ts/master/src/mod.ts
```

## Usage

```
    tlr [-u USER] [-w "USER1 USER2 ..."] [-o OUTPUT]

OPTIONS:
    -u, --user USER
        Record a livestream from the username
    -w, --watch "USER1 USER2 ..."
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
