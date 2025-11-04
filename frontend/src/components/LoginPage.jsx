import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import { submitLogin } from "../fetch/Authentication";
import TextInput from "./util-components/TextInput";
import { useMessagesContext } from "../application-context/MessagesContext";
import { useUserContext } from "../application-context/UserContext";

import '../static/card.css'
import '../static/util.css'

function LoginPage() {
    const { resetMessages, setLoadingMessage, setErrorMessage } = useMessagesContext();
    const { retrieveCurrentUser, userLoading, user } = useUserContext();

    const [loginLoading, setLoginLoading] = useState<boolean>(false);

    const [primaryKeyInput, setPrimaryKeyInput] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const navigate = useNavigate();

    async function login(){
        if(loginLoading){
            return;
        }

        resetMessages();
        setLoginLoading(true);
        setLoadingMessage("Loading...");

        let isUsername = true;

        if(primaryKeyInput.includes("@")){
            isUsername = false
        }

        const loginResponse = await submitLogin(isUsername, primaryKeyInput, password);

        setLoadingMessage("");
        setLoginLoading(false);

        if(loginResponse.error){
            setErrorMessage("Error logging in");
            return;
        }

        if(loginResponse.status == 400){
            setErrorMessage("Invalid credentials");
            return;
        }

        if(loginResponse.status === 403){
            setErrorMessage("Your account is not active");
            return;
        }

        if(loginResponse.status === 200){
            retrieveCurrentUser();
            setLoadingMessage("");
            setLoginLoading(false);
            navigate("/");
            return;
        }        
    }

    if(userLoading){
        return null;
    }

    if(user.isLoggedIn){
        return(
            <div>
                <Navigate replace to="/"/>
            </div>
        );
    }

    return(
        <div className="custom-card rounded-15 mx-auto mt-2" style={{width: "21rem"}}>
            <div className="custom-card-header">
                <h2>Login</h2>
            </div>
            <div className="custom-card-body">
                <TextInput id="email-username-input" type="email" className="mb-2" placeholder="Username or email" value={primaryKeyInput} setValue={setPrimaryKeyInput} onEnterFunction={login} outline={false} />
                <TextInput id="password-input" type="password" className="mb-2" placeholder="Password" value={password} setValue={setPassword} onEnterFunction={login} outline={false}/>
                {loginLoading && <button type="submit" className="btn btn-primary w-100 rounded-15" disabled>Loading...</button>}
                {!loginLoading && <button type="submit" className="btn btn-primary w-100 rounded-15" onClick={login}>Login</button>}
                <div className="container d-flex justify-content-center">
                    <small className="mt-2 px-3"><Link to="/find-account">Forgot your password?</Link></small>
                </div>
                <hr />
                <Link to="/register" className="btn btn-success w-100 rounded-15">Create account</Link>
            </div>
        </div>
    );
}

export default LoginPage;