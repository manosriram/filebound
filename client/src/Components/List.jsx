import {save} from 'save-file';
import React, { Fragment, useState } from "react";
import Download from "./Download";
import { useLocation } from "react-router-dom";
import "./App.css"
import {Icon} from '@blueprintjs/core';

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
        await save(fd, 'Archive.zip');
    };

    if (ld) return <div id="spin"></div>
    else {
        return (
            <>
            <div id="list">
                {props.names.map(name => {
                    console.log(name);
                    return (
                        <Fragment>
                            <h2>{name}</h2>
                        </Fragment>
                    );
                })}
            </div>
            <div id="download">
            <h2>
                <a onClick={handleDownload}>
                    <Icon icon="download" iconSize={25} /> Download
                </a>
            </h2>
            </div>
            </>
        );
    }
};

export default List;
