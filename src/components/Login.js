import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "../supabaseClient";

const Page = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4e73df, #1cc88a);
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  width: 380px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 25px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: #4e73df;
    box-shadow: 0 0 5px rgba(78, 115, 223, 0.4);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;

  &:hover {
    background: #2e59d9;
    transform: translateY(-2px);
  }
`;

const SmallText = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
  color: #666;
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <Page>
      <Card>
        <Title>Welcome Back 👋</Title>

        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button onClick={handleLogin}>Login</Button>

        <SmallText>
          Don’t have an account? Create one
        </SmallText>
      </Card>
    </Page>
  );
}