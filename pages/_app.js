import { Auth0Provider } from "@auth0/auth0-react";
import "../public/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_ID}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      redirectUri={process.env.NEXT_PUBLIC_AUTH0_REDIRECT}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}
