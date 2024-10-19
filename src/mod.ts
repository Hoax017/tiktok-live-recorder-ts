import { parse } from "./deps.ts";
import usage from "./usage.ts";
import recordUser from "./recordUser.ts";
import watchUsers from "./watchUsers.ts";

if (import.meta.main) {
  const { args } = Deno;
  const parsedArgs = parse(args);

  validateArgs(args, parsedArgs);

  const user = parsedArgs.u || parsedArgs.user;
  const inputFile = parsedArgs.i || parsedArgs.input;
  const rawUsers = parsedArgs.w || parsedArgs.watch;
  const output = parsedArgs.o || parsedArgs.output;
  const convertMp4: string | boolean = parsedArgs.c || parsedArgs.convert;
  const debug: boolean = !!(parsedArgs.d || parsedArgs.debug);
  let users: string[] | null = null;

  if (user && rawUsers) {
    usage(`"-u" and "-w" should not be used at the same time`);
    Deno.exit();
  }

  // parse user file
  if (typeof inputFile === "string") {
    try {
      const rawFileContent = new TextDecoder().decode(
        await Deno.readFile(inputFile),
      );
      users = rawFileContent.split("\n").filter((e) => e && e.charAt(0) !== "#")
        .map((e) => e.trim());
    } catch (e) {
      console.error(`could not read input file: ${inputFile}`, e);
      Deno.exit();
    }
  }

  if (output && typeof output !== "string") {
    usage("-o: output dir is not provided");
    Deno.exit();
  }

  const recording: Recording = {};

  if (user) {
    if (typeof user !== "string") {
      usage("-u: username is not provided");
      Deno.exit();
    }
    await recordUser(user, recording, convertMp4, output, debug);
  }

  if (rawUsers) {
    if (typeof rawUsers === "string") {
      users = rawUsers.split(" ");
    } else {
      usage("-w: user list is not provided");
    }
  }

  if (users) {
    if (!Array.isArray(users) || !users.length) {
      usage("user list is empty");
      Deno.exit();
    }
    watchUsers(users, recording, convertMp4, output, debug);
  }
}

function validateArgs(
  args: string[],
  parsedArgs: {
    // deno-lint-ignore no-explicit-any
    [x: string]: any;
    _: (string | number)[];
  },
) {
  const allowedOpts = [
    "h",
    "help",
    "u",
    "user",
    "w",
    "watch",
    "o",
    "output",
    "i",
    "input",
    "c",
    "convert",
    "d",
    "debug",
  ];

  if (args.length == 0) {
    usage();
    Deno.exit();
  }

  Object.keys(parsedArgs).forEach((arg) => {
    if (arg == "_") return;
    if (!allowedOpts.includes(arg)) {
      usage(`bad option: -${arg}`);
      Deno.exit();
    }
  });

  if (parsedArgs.help || parsedArgs.h) {
    usage();
    Deno.exit();
  }
}
