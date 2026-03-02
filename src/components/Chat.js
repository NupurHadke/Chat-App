import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import "../App.css";

export default function Chat({ session }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);
  const user = session.user;

  // FORMAT TIME (12:11 PM)
  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FETCH MESSAGES
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase.from("messages").insert([
      {
        content: newMessage,
        user_id: user.id,
        type: "user",
      },
    ]);

    setNewMessage("");
  };

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ONLINE STATUS
  useEffect(() => {
    const setOnline = async () => {
      await supabase.from("online_users").upsert({
        user_id: user.id,
        email: user.email,
        last_seen: new Date(),
      });
    };

    setOnline();

    const interval = setInterval(() => {
      supabase
        .from("online_users")
        .update({ last_seen: new Date() })
        .eq("user_id", user.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // FETCH ONLINE USERS
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const fifteenSecondsAgo = new Date(
        Date.now() - 15000
      ).toISOString();

      const { data } = await supabase
        .from("online_users")
        .select("*")
        .gt("last_seen", fifteenSecondsAgo);

      setOnlineUsers(data || []);
    };

    fetchOnlineUsers();

    const channel = supabase
      .channel("online-users-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_users" },
        () => fetchOnlineUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Realtime Chat</h2>

        <div className="user-info">
          <p>{user.email}</p>
          <button onClick={() => supabase.auth.signOut()}>
            Logout
          </button>
        </div>

        <h4 style={{ marginTop: "30px" }}>Online Users</h4>

        {onlineUsers.map((u) => (
          <div key={u.user_id} className="online-user">
            <span className="green-dot"></span>
            {u.email}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>Chat Room</h3>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => {
            const isOwn = msg.user_id === user.id;
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="system-message">
                  System: {msg.content}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`message ${isOwn ? "own" : "other"}`}
              >
                <div>{msg.content}</div>
                <div className="time">
                  {formatTime(msg.created_at)}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        <div className="chat-input">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}