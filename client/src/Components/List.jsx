import {save} from 'save-file';
import React, { Fragment, useState } from "react";
import Download from "./Download";
import { useLocation } from "react-router-dom";
import "./App.css"
import {Icon} from '@blueprintjs/core';
import Downloaded from './Downloaded';

const List = props => {
    const [ld, isld] = useState(false);
    const [dec, setDec] = useState("");
    const [fd, setFd] = useState({});
    const [downloaded, setDownloaded] = useState(false);
    let loc = useLocation();
    const hash = loc.pathname.split("|")[1];
    const url = loc.pathname.split("|")[0].split("/")[2];

    const getLS = () => {
        const combined = (url + '|' + hash);
        let pastData = JSON.parse(localStorage.getItem("session"));

        for (let t=0;t<pastData.length;++t) {
            if (pastData[t].url === combined) {
                pastData[t].downloads -= 1;
                if (pastData[t].downloads == 5) {
                    pastData.splice(t, 1);
                    break;
                }
            }
        }
        localStorage.setItem("session", JSON.stringify(pastData));
    };

    const getDecryptURL = async () => {
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
        getLS();
        const resp = await fetch("/file/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.half })
        });
        setDownloaded(true);
        await save(fd, 'Archive.zip');
    };

    if (downloaded) return <Downloaded />
    if (ld) return <div id="spin"></div>
    else {
        return (
            <>
            <div id="list">
                {props.names.map(name => {
                    return (
                        <Fragment>
                            <h2 onClick={getLS}>{name}</h2>
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
