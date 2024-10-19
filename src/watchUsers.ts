import recordUser from "./recordUser.ts";

export default function watchUsers(
  users: string[],
  recording: Recording,
  output?: string,
) {
  const watchUsersIter = () => {
    console.log("Checking users...");

    const checkUser = async (user: string) => {
      console.log(`Checking ${user}`);
      if (!recording[user]) await recordUser(user, recording, output);
      else console.log(`Still recording ${user}`);
    };

    Promise.all(users.map(checkUser)).then(() => {
      console.log("All users checked");
    }).catch((e) => {
      console.error("Error checking users", e);
    });

    setTimeout(watchUsersIter, 180000);
  };

  return watchUsersIter();
}
