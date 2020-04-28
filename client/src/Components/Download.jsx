import Verify from "./Verify";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import List from "./List";
import BASE from "./Config";
import "./App.css";

const Download = props => {
    const [ld, isld] = useState(false);
    const [url, surl] = useState("");
    const [names, setNames] = useState([]);
    const [err, setErr] = useState("");
    const [pass, setPass] = useState(false);
    const [filePass, setFilePass] = useState("");
    const [total, setTotal] = useState({});
    const [half, setHalf] = useState("");
    const [hash, setHash] = useState("");
    let loc = useLocation();

    const listFiles = async url => {
        const resp = await fetch("/file/verifyLink", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });
        const data = await resp.json();
        if (data.valid) {
            setNames(data.data.names);
            setPass(data.data.password);
            setTotal(data.data);
        } else setErr(data.msg);
    };

    React.useEffect(() => {
        isld(true);
        setHash(loc.pathname.split("|")[1]);
        const url = loc.pathname.split("|")[0].split("/")[2];
        surl(BASE + url + '.zip');

        listFiles(url);
        setHalf(url);
        isld(false);
    }, []);

    const handleChange = e => {
        setFilePass(e.target.value);
    };

    if (ld) return <div id="spin"></div>
    if (props.valid) return <List names={names} half={half} />

    if (pass) return <Verify url={half} />;
    else if (err) return (
        <>
        <h4 id="info">This link is end-to-end encrypted and shared via reserve with a link that is time-bounded!💥</h4>
        <h2 id="err">{err}<br/><a href="/">Try Uploading new files?</a></h2>
        </>
    )
    else return <List names={names} half={half} />;
};

export default Download;
