import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { supabase } from "../supabaseClient";

const Container = styled.div`
  max-width: 900px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagesBox = styled.div`
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 15px;
  margin: 15px 0;
  background: #f9f9f9;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${(props) =>
    props.system
      ? "center"
      : props.own
      ? "flex-end"
      : "flex-start"};
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  background: ${(props) =>
    props.system
      ? "#e0e0e0"
      : props.own
      ? "#4e73df"
      : "#e5e5ea"};
  color: ${(props) =>
    props.system
      ? "#555"
      : props.own
      ? "white"
      : "black"};
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 60%;
  font-size: 14px;
  font-style: ${(props) => (props.system ? "italic" : "normal")};
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
`;

const TimeText = styled.div`
  font-size: 10px;
  margin-top: 5px;
  opacity: 0.7;
  text-align: right;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 14px;
  background: #4e73df;
  color: white;
  border: none;
  cursor: pointer;
`;

const OnlineUser = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const GreenDot = styled.span`
  height: 10px;
  width: 10px;
  background-color: green;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

export default function ChatRoom({ session }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  const user = session.user;

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // FETCH MESSAGES + REALTIME
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

  // ✅ STEP 2: Insert "User Joined" Message
  useEffect(() => {
  const insertJoinMessage = async () => {
    const { error } = await supabase
      .from("messages")
      .insert([
        {
          content: `${user.email.split("@")[0]} joined the chat`,
          user_id: user.id,  
          type: "system",
        },
      ]);

    if (error) {
      console.log("Join message error:", error.message);
    }
  };

  insertJoinMessage();
}, [user]);

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

  // ONLINE STATUS UPDATE
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
    <Container>
      <Header>
        <h2>Realtime Chat</h2>
        <Button onClick={() => supabase.auth.signOut()}>
          Logout
        </Button>
      </Header>

      <div>
        <h4>Online Users</h4>
        {onlineUsers.map((u) => (
          <OnlineUser key={u.user_id}>
            <GreenDot />
            {u.email} (Online)
          </OnlineUser>
        ))}
      </div>

      <MessagesBox>
        {messages.map((msg) => {
          const isSystem = msg.type === "system";

          return (
            <MessageRow
              key={msg.id}
              own={msg.user_id === user.id}
              system={isSystem}
            >
              <MessageBubble
                own={msg.user_id === user.id}
                system={isSystem}
              >
                {isSystem
                  ? `System: ${msg.content}`
                  : msg.content}

                {!isSystem && (
                  <TimeText>
                    {formatTime(msg.created_at)}
                  </TimeText>
                )}
              </MessageBubble>
            </MessageRow>
          );
        })}
        <div ref={bottomRef} />
      </MessagesBox>

      <InputContainer>
        <input
          style={{ flex: 1, padding: "8px" }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </InputContainer>
    </Container>
  );
}