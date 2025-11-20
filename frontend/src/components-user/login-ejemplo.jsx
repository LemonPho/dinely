import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import TextInput from "./util-components/TextInput";
import { useAuthenticationContext } from "../application-context/AuthenticationContext";
import { useUserContext } from "../application-context/UserContext";

import '../static/card.css'
import '../static/util.css'

export default function LoginPage() {
  const { login, loading: loginLoading } = useAuthenticationContext();
  const { retrieveCurrentUser, userLoading, user } = useUserContext();

  const [loginInput, setLoginInput] = useState({
    primaryKey: "",
    password: ""
  })

  const navigate = useNavigate();

  async function handleLogin() {
    await login(loginInput, retrieveCurrentUser, navigate);
  }

  function handlePrimaryKeyInput(string){
    setLoginInput({
      ...loginInput,
      primaryKey: string,
    });
  }

  function handlePasswordInput(string){
    setLoginInput({
      ...loginInput,
      password: string,
    })
  }

  if (userLoading) {
    return null;
  }

  if (user != undefined) {
    return (
      <div>
        <Navigate replace to="/" />
      </div>
    );
  }

  return (
    <div className="custom-card rounded-15 mx-auto" style={{ maxWidth: "21rem" }}>
      <div className="custom-card-header">
        <h2>Login</h2>
      </div>
      <div className="custom-card-body">
        <TextInput id="email-name-input" type="email" className="mb-2 nested" placeholder="Username or email" value={loginInput.primaryKey} setValue={handlePrimaryKeyInput} onEnterFunction={handleLogin} outline={false} />
        <TextInput id="password-input" type="password" className="mb-2 nested" placeholder="Password" value={loginInput.password} setValue={handlePasswordInput} onEnterFunction={handleLogin} outline={false} />
        {loginLoading && <button type="submit" className="btn btn-primary w-100 rounded-15" disabled>Loading...</button>}
        {!loginLoading && <button type="submit" className="btn btn-primary w-100 rounded-15" onClick={handleLogin}>Login</button>}
        <div className="container d-flex justify-content-center">
          <small className="mt-2 px-3"><Link to="/find-account">Forgot your password?</Link></small>
        </div>
        <hr />
        <Link to="/register" className="btn btn-success w-100 rounded-15">Create account</Link>
      </div>
    </div>
  );
}