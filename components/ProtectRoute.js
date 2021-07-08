// HOC/withAuth.jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { verifyToken } from "services";

import Spinner from "./Spinner";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const fetchToken = async () => {
        const IPAYPOSUSER = sessionStorage.getItem("IPAYPOSUSER");
        if (!IPAYPOSUSER) {
          Router.replace("/auth/login");
        } else {
          const data = verifyToken(IPAYPOSUSER);
          if (data?.verified) {
            setVerified(data.verified);
          } else {
            sessionStorage.removeItem("IPAYPOSUSER");
            Router.replace("/auth/login");
          }
        }
      };

      fetchToken();
    }, []);

    if (verified) {
      return <WrappedComponent {...props} />;
    } else {
      return (
        <div className="h-screen flex flex-col justify-center items-center w-full">
          <Spinner type={"TailSpin"} height={50} width={50} />
        </div>
      );
    }
  };
};

export default withAuth;
