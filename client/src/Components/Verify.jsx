import React, { Fragment, useState } from "react";
import Download from "./Download";
import "./App.css";
import {InputGroup, Toaster, Toast} from '@blueprintjs/core';
import './Media.css';

const Verify = props => {
    const [filePass, setFilePass] = useState("");
    const [valid, setValid] = useState(false);
    const [msg, setMSG] = useState("");

    const handleChange = e => {
        setFilePass(e.target.value);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const resp = await fetch("/file/verifyPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.url, password: filePass })
        });
        const data = await resp.json();
        setValid(data.valid);
        if (!data.valid) setMSG("Wrong Pass!");
    };

    if (valid) return <Download valid={true} url={props.url} />;
    else {
        return (
            <form id="auth-form" action="" onSubmit={handleSubmit}>
            <div id="message">
                {msg && (
                    <div id="toast" onClick={() => setMSG("")}>
                        <Toaster>
                            <Toast
                                intent="danger"
                                timeout={5000}
                                message={msg}
                            />
                        </Toaster>
                    </div>
                )}
            </div>
            <div id="passgroup">
                <InputGroup
                    autofocus="on"
                    type="password"
                    name="pass"
                    placeholder="URL Password"
                    fill={true}
                    large={true}
                    onChange={e => handleChange(e)}
                />
                <br />

                <input className="bp3-button" id="sub" type="submit" value="Verify" />
            </div>
            </form>
        );
    }
};

export default Verify;
