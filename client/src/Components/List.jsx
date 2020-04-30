import axios from "axios";
import { save } from "save-file";
import React, { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import { Spinner, Icon } from "@blueprintjs/core";
import Downloaded from "./Downloaded";
import Progress from "./Progress";

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

    const getDecryptURL = async () => {
        const resp = await fetch("/file/decryptFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url, hash: hash })
        }).then(resp => {
            const reader = resp.body.getReader();

            const stream = new ReadableStream({
                start(controller) {
                    // The following function handles each data chunk
                    function push() {
                        // "done" is a Boolean and value a "Uint8Array"
                        return reader.read().then(({ done, value }) => {
                            // Is there no more data to read?
                            if (done) {
                                // Tell the browser that we have finished sending data
                                controller.close();
                                return;
                            }

                            // Get the data and send it to the browser via the controller
                            controller.enqueue(value);
                            setFd(value);
                            push();
                        });
                    }

                    push();
                }
            });
        });
        isld(false);
    };

    React.useEffect(() => {
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
        await save(fd, "Archive.zip");
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
