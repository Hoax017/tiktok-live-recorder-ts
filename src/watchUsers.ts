import recordUser from "./recordUser.ts";

export default function watchUsers(
  users: string[],
  recording: Recording,
  convertMp4: string | boolean,
  output?: string,
  debug?: boolean,
) {
  const watchUsersIter = () => {
    console.log("Checking users...");

    const checkUser = async (user: string) => {
      if (debug) console.log(`Checking ${user}`);
      if (!recording[user]) {
        await recordUser(user, recording, convertMp4, output);
      } else if (debug) {
        console.log(`Still recording ${user} (${recording[user]})`);
      }
    };

    Promise.all(users.map(checkUser)).then(() => {
      if (debug) console.log("All users checked");
    }).catch((e) => {
      console.error("Error checking users", e);
    });

    setTimeout(watchUsersIter, 30000);
  };

  return watchUsersIter();
}
