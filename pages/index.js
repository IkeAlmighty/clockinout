import LoginButton from "../lib/components/LoginButton";
import LogoutButton from "../lib/components/LogoutButton";

import Head from "next/head";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();

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
            <button>PUNCH IN BB</button>
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
