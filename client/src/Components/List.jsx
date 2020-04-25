import {save} from 'save-file';
import React, { Fragment, useState } from "react";
import Download from "./Download";
import { useLocation } from "react-router-dom";
import "./App.css"

const List = props => {
    const [ld, isld] = useState(false);
    const [dec, setDec] = useState("");
    const [fd, setFd] = useState({});
    let loc = useLocation();

    const getDecryptURL = async () => {
        const hash = loc.pathname.split("|")[1];
        const url = loc.pathname.split("|")[0].split("/")[2];
        const resp = await fetch("/file/decryptFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url, hash: hash })
        });
        const data = await resp.json();
        setFd(data.data);
        isld(false);
    };

    React.useEffect(() => {
        isld(true);
        getDecryptURL();
    }, []);

    const handleDownload = async () => {
        const resp = await fetch("/file/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.half })
        });
        await save(fd, 'download.zip');
    };

    if (ld) return <h3>Spinning</h3>
    else {
        return (
            <Fragment>
                {props.names.map(name => {
                    return (
                        <Fragment>
                            <h4>{name}</h4>
                        </Fragment>
                    );
                })}
                <br />
                <a onClick={handleDownload}>
                    down
                </a>
            </Fragment>
        );
    }
};

export default List;
