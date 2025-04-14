import React, { useEffect, useState, useRef } from "react";

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const app = new window.webex.Application();
      await app?.ready();
      const user = await app?.getUserInfo();
      setUserInfo(user);
    };
    init();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      sender: userInfo?.displayName || "You",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Bot",
          text: `Echo: ${newMessage.text}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="text-xl font-bold mb-2">Webex Embedded Chat</div>
      {userInfo && (
        <div className="text-sm mb-4">Logged in as: {userInfo.displayName}</div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-white rounded-xl shadow">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl max-w-[75%] shadow-md ${
              msg.sender === "Bot" ? "bg-blue-100 self-start" : "bg-green-100 self-end ml-auto"
            }`}
          >
            <div className="text-sm font-medium">{msg.sender}</div>
            <div>{msg.text}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          className="flex-1 p-2 rounded-lg border border-gray-300 resize-none"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Type your message..."
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;