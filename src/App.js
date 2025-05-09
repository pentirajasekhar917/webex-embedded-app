import React, { useEffect, useMemo, useState } from "react";
import { Application } from "@webex/embedded-app-sdk";

const STORAGE_KEY = "offline-submissions";
const ROWS_KEY = "project-rows";

const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const dummyOptions = {
  project: ["NC.TS.AS2025", "TATA.CSUP.GEN25"],
  task: ["General", "Non assisted channel", "Upgrade"],
  location: ["India", "US"],
  region: ["Hyderabad", "Bengaluru"],
};

const getEmptyRow = () => ({
  project: "",
  task: "",
  location: "",
  region: "",
  workItems: ["", "", "", "", "", "", ""],
  workItemText: "",
  comment: "",
});

function App() {
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState("");
  const [rows, setRows] = useState(() => {
    return JSON.parse(localStorage.getItem(ROWS_KEY)) || [getEmptyRow()];
  });
  const [user, setUser] = useState();
  const [webexApp, setWebexApp] = useState();
  const [shareUrlTest, setShareUrlTest] = useState('Testing ')


  useEffect(() => {
    const initWebex = async () => {
      try {
        //setStatus((s) => s + " | Creating instance");
        const app = new Application();
        setStatus(" |✅ Webex Ready: ");

        app.onReady().then(() => {
          setShareUrlTest('OnReady')
          setWebexApp(app);
          console.log("Webex App Ready", app);
        }).catch(error => {
          console.error("Error initializing Webex App", error);
        });

        tryToResend();


        // const frameContext1 = await app.onReady();
        // setFrameContext(frameContext1);
        // // 👇 Set Share URL if running in a space (not meeting)
        // if (frameContext1.type === "space") {
        //   await app.setShareUrl(window.location.href);
        //   console.log("✅ Share URL set for space tab");
        // }
        //setStatus((s) => s + " | onReady done");

        const userInfo = await app.user?.getUser(); // No need for `app.user.getUser()` — just `app.getUser()`!
        //setStatus((s) => s + " | getUser done");

        console.log("👤 User info:", userInfo);

        setUser(userInfo);
      } catch (err) {
        setStatus(" |✅ Webex Ready: ");
        console.warn(
          "⚠️ Could not initialize Webex SDK. Are you running inside Webex?",
          err
        );
        setError(err?.message || String(err));
        // setStatus(
        //   (s) => s + " | 🧪 Running outside Webex: " + (err?.message || err)
        // );

        // fallback for testing outside Webex
        setUser({
          displayName: "Dev User",
          email: "dev@example.com",
        });
        
      }
    };

    initWebex();
    window.addEventListener("online", tryToResend);
  }, []);

  const showAlert = (message, type = "info") => {
    const colors = {
      success: "#28a745",
      warning: "#ffc107",
      info: "#17a2b8",
      danger: "#dc3545",
    };

    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.backgroundColor = colors[type] || "#17a2b8";
    alertBox.style.color = "white";
    alertBox.style.padding = "10px 16px";
    alertBox.style.borderRadius = "6px";
    alertBox.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    alertBox.style.zIndex = "9999";
    alertBox.style.fontSize = "14px";

    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 5000);
  };

  const tryToResend = async () => {
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (navigator.onLine && submissions.length > 0) {
      for (let data of submissions) {
        console.log(' data ------:', data);
        await sendToBackend(data);
      }
      localStorage.removeItem(STORAGE_KEY);
      showAlert("✅ Offline data successfully sent to server", "success");
      setStatus("✅ Resent offline data");
    }
  };

  const handleSubmit = async () => {
    if (navigator.onLine) {
      for (let row of rows) {
        await sendToBackend(row);
      }
      setStatus("✅ Submitted online");
      showAlert("✅ Data submitted successfully!", "success");
    } else {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...rows]));
      showAlert(
        "⚠ You are offline. Data will be saved automatically once you are online.",
        "warning"
      );
      setStatus("📴 Offline — saved for retry");
    }
  };

  const sendToBackend = async (data) => {
    try {
      await fetch(
        "https://dhwanika.app.n8n.cloud/webhook-test/chatgpt-webhook/test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      console.log("Sent to webhook:", data);
    } catch (err) {
      console.error("Error sending:", err);
    }
  };

  const updateRow = (index, field, value, subIndex = null) => {
    const updatedRows = [...rows];
    if (field === "workItems" && subIndex !== null) {
      updatedRows[index].workItems[subIndex] = value;
    } else {
      updatedRows[index][field] = value;
    }
    setRows(updatedRows);
    localStorage.setItem(ROWS_KEY, JSON.stringify(updatedRows));
  };

  const addRow = () => {
    const updated = [...rows, getEmptyRow()];
    setRows(updated);
    localStorage.setItem(ROWS_KEY, JSON.stringify(updated));
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    localStorage.setItem(ROWS_KEY, JSON.stringify(updated));
  };

  const getRecords = () => {
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    let result = [];
    for (let data of submissions) {
      result.push(data?.project);
    }
  };

  return (
    <div className="container">
      <h1>shareUrlTest : {shareUrlTest}</h1>
      <button onClick={() => {
        setShareUrlTest(' Onclick before setting share url')
        if (webexApp) {
          setShareUrlTest(' setting share url  :');
          webexApp.setShareUrl('https://webex-embedded-app.vercel.app', 'https://webex-embedded-app.vercel.app', 'MyEmbeddedApp').then((re) => {
            setShareUrlTest(' the setShare url is set successfully ');
          }).catch(err => setShareUrlTest('Got error :'+err));
        }
      }}>Add to a tab</button>

      <h2>Workmate Assistant</h2>
      {user && (
        <p className="user-info">
          👋 Hello, <strong>{user.displayName}</strong>
        </p>
      )}
      <p className="status">Status: {status}</p>

      <p>
        The records that are saved in localStorage:
        {getRecords()}
      </p>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Task</th>
            {/* <th>Location</th>
            <th>Region</th>
            {weekDays.map((day) => (
              <th key={day}>{day}</th>
            ))}
            <th>Work Item</th>
            <th>Comments</th>
            <th>Delete</th> */}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <select
                  value={row.project}
                  onChange={(e) =>
                    updateRow(rowIndex, "project", e.target.value)
                  }
                >
                  <option value="">--Select--</option>
                  {dummyOptions.project.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={row.task}
                  onChange={(e) => updateRow(rowIndex, "task", e.target.value)}
                >
                  <option value="">--Select--</option>
                  {dummyOptions.task.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </td>
              {/* <td>
                <select
                  value={row.location}
                  onChange={(e) =>
                    updateRow(rowIndex, "location", e.target.value)
                  }
                >
                  <option value="">--Select--</option>
                  {dummyOptions.location.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={row.region}
                  onChange={(e) =>
                    updateRow(rowIndex, "region", e.target.value)
                  }
                >
                  <option value="">--Select--</option>
                  {dummyOptions.region.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </td>
              {weekDays.map((_, i) => (
                <td key={i}>
                  <input
                    type="text"
                    value={row.workItems[i]}
                    onChange={(e) =>
                      updateRow(rowIndex, "workItems", e.target.value, i)
                    }
                  />
                </td>
              ))}
              <td>
                <input
                  type="text"
                  value={row.workItemText}
                  onChange={(e) =>
                    updateRow(rowIndex, "workItemText", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.comment}
                  onChange={(e) =>
                    updateRow(rowIndex, "comment", e.target.value)
                  }
                />
              </td> */}
              <td>
                <button
                  className="btn danger"
                  onClick={() => deleteRow(rowIndex)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-group">
        <button className="btn secondary" onClick={addRow}>
          ➕ Add Row
        </button>
        <button className="btn primary" onClick={handleSubmit}>
          ✅ Submit
        </button>
      </div>

      <style>{`
        .container {
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f9f9f9;
}

h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.status {
  margin-bottom: 1.5rem;
  color: #555;
}

.styled-table {
  width: 150px;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  table-layout: fixed;
}

.styled-table th, .styled-table td {
  text-align: center;
  padding: 8px;
  border: 1px solid #e0e0e0;
}

.styled-table th {
  background-color: #004c99;
  color: white;
  font-size: 14px;
}

/* Wider columns for Project (1), Task (2), Location (3), Region (4) */
.styled-table td:nth-child(1),
.styled-table th:nth-child(1),
.styled-table td:nth-child(2),
.styled-table th:nth-child(2),
.styled-table td:nth-child(3),
.styled-table th:nth-child(3),
.styled-table td:nth-child(4),
.styled-table th:nth-child(4) {
  width: 150px;
}

/* Narrower columns for SU to SA (5–11) */
.styled-table td:nth-child(n+5):nth-child(-n+11),
.styled-table th:nth-child(n+5):nth-child(-n+11) {
  width: 45px;
}

/* Inputs and selects inside cells */
.styled-table td select,
.styled-table td input {
  /*width: 100%;*/
  width: 100px;

  padding: 6px 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  /*max-width: 100%;*/
}

.styled-table td select {
  background-color: white;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styled-table td input:focus,
.styled-table td select:focus {
  outline: none;
  border-color: #0077cc;
  box-shadow: 0 0 4px rgba(0, 119, 204, 0.4);
}

.button-group {
  margin-top: 1.5rem;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn.primary {
  background-color: #28a745;
  color: white;
  margin-left: 10px;
}

.btn.primary:hover {
  background-color: #218838;
}

.btn.secondary {
  background-color: #007bff;
  color: white;
}

.btn.secondary:hover {
  background-color: #0069d9;
}

.btn.danger {
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
}

.btn.danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .styled-table {
    font-size: 12px;
  }

  .styled-table input,
  .styled-table select {
    padding: 4px;
  }

  .btn {
    width: 100%;
    margin-top: 0.5rem;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
`}</style>
    </div>
  );
}

export default App;
