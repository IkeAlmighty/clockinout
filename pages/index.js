import LoginButton from "../lib/components/LoginButton";
import LogoutButton from "../lib/components/LogoutButton";
import StopWatch from "../lib/components/StopWatch";

import { prettifyMs } from "../lib/time";

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

  async function removePunches(_id1, _id2) {
    // removes the 2 give punches (designed to remove an in and out punch)
    // first, send a post request to /api/punches/delete

    let punchDeleteResponse = await fetch("/api/punch/delete", {
      method: "DELETE",
      body: JSON.stringify({ _id1, _id2 }),
    });

    if (punchDeleteResponse.ok) {
      // then, remove the punches from the ui:
      setPunches(
        punches.filter((punch) => punch._id !== _id1 && punch._id !== _id2)
      );
    } else {
      toast("Server Error when trying to delete punches");
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
            <div className="text-center mt-10">
              {punchMode === "in" && (
                <button onClick={() => logTime(user, Date.now(), punchMode)}>
                  PUNCH IN
                </button>
              )}

              {punchMode === "out" && (
                <button onClick={() => logTime(user, Date.now(), punchMode)}>
                  PUNCH OUT!!!!!
                </button>
              )}
            </div>

            <div className="text-center mb-10 mt-5 text-2xl">
              <StopWatch since={punchInTime} />
            </div>

            <div className="my-2">
              {punches.map((punch, index) => {
                if (punch.mode === "out" && index + 1 < punches.length) {
                  const elapsed = punch.time - punches[index + 1].time;

                  return (
                    <div
                      key={`${punch._id}_${punches[index + 1]._id}`}
                      className="my-1"
                    >
                      <div className="p-1 inline-block mx-1 w-[100px]">
                        {prettifyMs(elapsed)}
                      </div>
                      <div className="inline-block">
                        <input
                          className="p-1 w-[200px]"
                          type="text"
                          placeholder="label: not yet implemented!"
                        />
                      </div>
                      <div
                        onClick={() =>
                          removePunches(punch._id, punches[index + 1]._id)
                        }
                        className="float-right cursor-pointer mx-2 inline-block text-red-500"
                      >
                        x
                      </div>
                    </div>
                  );
                }
              })}
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
