import Verify from "./Verify";
import React, { Fragment, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import List from "./List";
import BASE from "./Config";

const Download = props => {
    const [url, surl] = useState("");
    const [names, setNames] = useState([]);
    const [err, setErr] = useState("");
    const [pass, setPass] = useState("");
    const [filePass, setFilePass] = useState("");
    const [total, setTotal] = useState({});
    const [half, setHalf] = useState("");
    let loc = useLocation();

    React.useEffect(() => {
        let ph = loc.pathname.split("/")[2];
        setHalf(ph);
        listFiles(ph);
        surl(BASE + ph + ".zip");
    }, []);

    const handleChange = e => {
        setFilePass(e.target.value);
    };

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
            if (data.data.password) setPass(data.data.password);
            setTotal(data.data);
        } else setErr(data.msg);
    };

    if (props.valid) return <List names={names} url={url} half={half} />;
    if (err) return <h3>{err}</h3>;
    console.log(pass);
    if (pass.length > 0) {
        return <Verify url={half} />;
    } else {
        return <List names={names} url={url} half={half} />;
    }
};

export default Download;
