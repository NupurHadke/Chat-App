import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "../supabaseClient";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  margin: auto;
  margin-top: 120px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: none;
  background: #4e73df;
  color: white;
  cursor: pointer;

  &:hover {
    background: #2e59d9;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: #4e73df;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 14px;
  color: red;
`;

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true); // 🔥 Toggle state

  // 🔁 Toggle Function
  const handleToggle = () => {
    console.log("Toggle clicked");
    setIsLogin(!isLogin);
    setMessage("");
  };

  // ✅ LOGIN
  const signIn = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    }
  };

  // ✅ SIGN UP
  const signUp = async () => {
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signup successful! Now login ✅");
      setIsLogin(true); // switch back to login
    }
  };

  return (
    <Container>
      <Title>{isLogin ? "Welcome Back 👋" : "Create Account 🚀"}</Title>

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isLogin ? (
        <Button onClick={signIn}>Login</Button>
      ) : (
        <Button onClick={signUp}>Sign Up</Button>
      )}

      <ToggleText onClick={handleToggle}>
        {isLogin
          ? "Don’t have an account? Create one"
          : "Already have an account? Login"}
      </ToggleText>

      {message && <Message>{message}</Message>}
    </Container>
  );
}