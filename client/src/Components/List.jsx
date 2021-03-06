import axios from "axios";
import React, { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import { Spinner, Icon } from "@blueprintjs/core";
import Downloaded from "./Downloaded";
import Progress from "./Progress";
import { saveAs } from "file-saver";
import { save } from "save-file";
const AdmZip = require("adm-zip");
const jszip = require("jszip");

const List = props => {
    const [ld, isld] = useState(true);
    const [fd, setFd] = useState({});
    const [downloaded, setDownloaded] = useState(false);
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    let loc = useLocation();
    const hash = loc.pathname.split("|")[1];
    const url = loc.pathname.split("|")[0].split("/")[2];

    const getLS = () => {
        const combined = url + "|" + hash;
        let pastData = JSON.parse(localStorage.getItem("session"));

        for (let t = 0; t < pastData.length; ++t) {
            if (pastData[t].url == combined) {
                pastData[t].downloads -= 1;
                if (pastData[t].downloads == 5) {
                    pastData.splice(t, 1);
                    break;
                }
            }
        }
        localStorage.setItem("session", JSON.stringify(pastData));
    };

    const downloadZip = () => {
        fetch("/file/decryptFile", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ url, hash })
        })
            .then(resp => resp.blob())
            .then(blob => setFd(blob))
            .then(() => isld(false))
            .catch(err => console.log(err));
    };

    React.useEffect(() => {
        downloadZip();
    }, []);

    const handleDownload = async () => {
        isld(true);
        const resp = await fetch("/file/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.half })
        });
        getLS();
        setDownloaded(true);
        saveAs(fd, "Archive.zip");
    };

    if (downloaded) return <Downloaded />;
    if (ld) return <div id="spin"></div>;
    else {
        return (
            <>
                <div id="list">
                    {props.names.map(name => {
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
                        <p id="err">or</p>
                        <a href="/">Try uploading some files?</a>
                    </h2>
                </div>
            </>
        );
    }
};

export default List;
