import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const waitForWebex = () => {
      if (window.webex?.Application) {
        const app = new window.webex.Application();
        app.ready()
          .then(() => app.getUserInfo())
          .then(setUserInfo)
          .catch((err) => setError("Failed to load user info: " + err.message));
      } else {
        setTimeout(waitForWebex, 200);
      }
    };
    waitForWebex();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Webex Embedded App Starter</h1>
      {userInfo ? (
        <p>👋 Hello, {userInfo.displayName}</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Loading user info from Webex...</p>
      )}
    </div>
  );
}

export default App;
