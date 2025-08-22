import React, { useState, useEffect, createContext } from "react";
import { Navigate } from "react-router-dom";

const UserContext = createContext({});

interface User {
  email: string;
}

function PrivateView(props: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  let emptyuser: User = { email: "" };

  const [user, setUser] = useState(emptyuser);

  useEffect(() => {
    let retryCount = 0;
    let maxRetries = 10;
    let delay: number = 1000;

    function wait(delay: number) {
      return new Promise((resolve) => setTimeout(resolve, delay));
    }

    async function fetchWithRetry(url: string, options: any) {
      try {
        let response = await fetch(url, options);

        if (response.status == 200) {
          console.log("Authorized");
          let j: any = await response.json();
          setUser({ email: j.email });
          setAuthorized(true);
          return response;
        } else if (response.status == 401) {
          console.log("Unauthorized");
          return response;
        } else {
          throw new Error("" + response.status);
        }
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw error;
        } else {
          await wait(delay);
          return fetchWithRetry(url, options);
        }
      }
    }

    fetchWithRetry("/pingauth", {
      method: "GET",
    })
      .catch((error) => {
        console.log(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <p>Loading...</p>
      </>
    );
  } else {
    if (authorized && !loading) {
      return (
        <>
          <UserContext.Provider value={user}>
            {props.children}
          </UserContext.Provider>
        </>
      );
    } else {
      return (
        <>
          <Navigate to="/login" />
        </>
      );
    }
  }
}

export function AuthorizedUser(props: { value: string }) {
  const user: any = React.useContext(UserContext);

  if (props.value == "email") return <>{user.email}</>;
  else return <></>;
}

export default PrivateView;
