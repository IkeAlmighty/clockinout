import LoginButton from "../lib/components/LoginButton";
import LogoutButton from "../lib/components/LogoutButton";
import StopWatch from "../lib/components/StopWatch";

import Head from "next/head";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const [punchMode, setPunchMode] = useState("none");
  const [punchInTime, setPunchInTime] = useState(undefined);
  const [punches, setPunches] = useState([]);

  // when a new user loads, make sure to get the user's current
  // punch status
  useEffect(() => {
    async function fetchAndSetPunchStatus() {
      if (!user) return;
      const status = await getPunchStatus(user);
      setPunchMode(status.mode);
      setPunchInTime(status.time);
    }

    fetchAndSetPunchStatus();
  }, [user]);

  useEffect(() => {
    async function fetchAndSetPunches() {
      if (!user) return;
      const listPunchesResponse = await fetch(
        `/api/punch/list?email=${user.email}`
      );
      const punches = await listPunchesResponse.json();

      setPunches(punches);
    }

    fetchAndSetPunches();
  }, [punchMode]);

  // helper function to get a user's punch status aka 'mode'
  async function getPunchStatus(user) {
    const punchStatusResponse = await fetch(
      `/api/punch/status?email=${user.email}`
    );

    if (punchStatusResponse.ok) {
      return await punchStatusResponse.json();
    } else {
      toast("Server Error while getting punch status", { autoClose: false });
      return "none";
    }
  }

  // logs either a punch-in or punch-out based on the mode ('in' or 'out') passed
  async function logTime(userData, time, mode) {
    const waitingMsg = toast("waiting for server...", {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    const punchResponse = await fetch("api/punch", {
      method: "POST",
      body: JSON.stringify({ user: userData, time, mode }),
    });

    toast.dismiss(waitingMsg);

    if (punchResponse.ok) {
      toast(`Successful Clock-${punchMode}. Good Job!`, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      setPunchMode(punchMode === "in" ? "out" : "in");
      setPunchInTime(punchMode === "in" ? time : undefined);
    } else {
      toast("Seems like there was a server error. Try punching in again.", {
        autoClose: false,
      });
    }
  }

  if (isLoading) return <div>Loading........ :&#41;</div>;

  return (
    <div>
      <Head>
        <title>Clock In/Out</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-right p-1 bg-violet-100">
        <div className="inline-block float-left m-2">
          <h1>Clock In/Out</h1>
        </div>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && <LogoutButton />}
      </div>

      <div className="p-3 max-w-lg mx-auto">
        {isAuthenticated ? (
          <div>
            {punchMode === "in" && (
              <button onClick={() => logTime(user, Date.now(), punchMode)}>
                PUNCH IN BB
              </button>
            )}

            {punchMode === "out" && (
              <button onClick={() => logTime(user, Date.now(), punchMode)}>
                PUNCH OUT!!!!!
              </button>
            )}

            {punchInTime && (
              <div className="inline-block mx-3">
                <StopWatch since={punchInTime} />
              </div>
            )}

            <div>
              {punches.map((punch) => (
                <div>
                  <div className="inline-block w-[50px]">{punch.mode}</div>:{" "}
                  {punch.time}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            Hey man, you gotta login to use this app. Click that button up there
            ^
          </div>
        )}
      </div>
    </div>
  );
}
