import { Auth0Provider } from "@auth0/auth0-react";
import { ToastContainer } from "react-toastify";
import "../public/globals.css";
import "react-toastify/dist/ReactToastify.min.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_ID}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      redirectUri={process.env.NEXT_PUBLIC_AUTH0_REDIRECT}
    >
      <ToastContainer />
      <Component {...pageProps} />
    </Auth0Provider>
  );
}
