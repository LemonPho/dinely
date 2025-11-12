import React, { useState, useEffect, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { useUserContext } from "../application-context/contexto-usuario";
import { useAuthenticationContext } from "../application-context/contexto-authenticacion";
import TextInput from "./util-components/TextInput";

import '../static/card.css'
import '../static/util.css'

export default function RegisterPage() {
  const { register, loading } = useAuthenticationContext();
  const { user, userLoading } = useUserContext();

  const [registerInput, setRegisterInput] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
  })

  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  function handleEmailInput(string) {
    setRegisterInput({
      ...registerInput,
      email: string,
    });
  }

  function handlePasswordInput(string) {
    setRegisterInput({
      ...registerInput,
      password: string,
    });
  }

  function handlePasswordConfirmationInput(string) {
    setRegisterInput({
      ...registerInput,
      passwordConfirmation: string,
    });
  }

  async function handleRegister() {
    await register(
      registerInput,
      setEmailInvalid,
      setPasswordInvalid
    );
  }

  if (userLoading){
    return;
  }

  if (user != undefined) {
    return (
      <div>
        <Navigate replace to="/" />
      </div>
    )
  }

  return (
    <div className="custom-card rounded-15 mx-auto mt-2" style={{ width: "21rem" }}>
      <div className="custom-card-header">
        <h2>Sign Up</h2>
      </div>
      <div className="custom-card-body">
        <TextInput type={"email"} className={"mb-2"} placeholder={"Email"} value={registerInput.email} setValue={handleEmailInput} onEnterFunction={handleRegister} outline={emailInvalid} />
        <TextInput type="password" className={"mb-2"} placeholder="Password" value={registerInput.password} setValue={handlePasswordInput} onEnterFunction={handleRegister} outline={passwordInvalid} />
        <TextInput type="password" className={"mb-2"} placeholder="Confirm password" value={registerInput.passwordConfirmation} setValue={handlePasswordConfirmationInput} onEnterFunction={handleRegister} outline={passwordInvalid} />

        {loading && <button className="btn btn-primary w-100 rounded-15 mt-2" disabled>Loading...</button>}
        {!loading && <button className="btn btn-primary w-100 rounded-15 mt-2" onClick={handleRegister}>Sign up</button>}
        <hr />
        <Link to="/login" className="btn btn-success w-100 rounded-15">Login to an account</Link>
      </div>
    </div>
  );
}