import { FocusStyleManager } from "@blueprintjs/core";
import {Tooltip, Intent, Button, InputGroup } from '@blueprintjs/core';
import {useDropzone} from 'react-dropzone';
import React, { Fragment, useState } from "react";
import axios from "axios";
import "./App.css";
import URL from "./URL";
import { useLocation } from "react-router-dom";
import Progress from "./Progress";
import Local from './Local';
var sz = 0;

//blueprint-js/core includes
function saveLS(data) {
    var a = [];
    a = JSON.parse(localStorage.getItem("session")) || [];
    a.push(data);
    localStorage.setItem("session", JSON.stringify(a));
}

function getLS() {
    const data = JSON.parse(localStorage.getItem("session"));
    if (!data) return [];
    else return data;
}

const bytesToMegaBytes = bytes => {
    return (bytes / (1024 * 1024)).toFixed(3);
};


const FileUpload = () => {
    FocusStyleManager.onlyShowFocusOnTabs();
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
    const [showPassword, setShowPassword] = useState(false);
    const [file, setFile] = useState([]);
    const [exp, setExp] = useState(5);
    const [url, surl] = useState("");
    const [pass, setPass] = useState(false);
    const [currPass, updPass] = useState("");
    const [dwn, setdwn] = useState(1);
    const [err, setErr] = useState("");
    const [ld, isld] = useState(false);
    const [uploadPercentage, setUploadPercentage] = useState(0);
    let loc = useLocation();

    const lockButton = (
        <Tooltip content={`${showPassword ? "Hide" : "Show"} Password`} disabled={!pass}>
        <Button
        disabled={!pass}
        icon={showPassword ? "unlock" : "lock"}
        intent={Intent.WARNING}
        minimal={true}
        onClick={() => setShowPassword(!showPassword)}
        />
        </Tooltip>
    );

    let path = "";
    const handleChange = e => {
        let fileList = [];
        fileList = e.target.files;
        for (let t = 0; t < e.target.files.length; ++t) {
            setFile(file => [...file, fileList[t]]);
            sz += e.target.files[t].size;
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        isld(true);
        const fd = new FormData();
        for (let t = 0; t < file.length; ++t) fd.append("files", file[t]);

        fd.append("expires", exp);
        return;
        if (currPass) fd.append("password", currPass);
        fd.append("downloads", dwn);

        try {
            const resp = axios
                .post("/file/upload", fd, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    onUploadProgress: progressEvent => {
                        let prog = parseInt(
                            Math.round(progressEvent.loaded * 100) /
                            progressEvent.total
                        );
                        if (prog <= 95) setUploadPercentage(prog);
                        else setUploadPercentage(99);
                    }
                })
                .then(res2 => {
                    setUploadPercentage(100);
                    if (!res2.data.scs) setErr(res2.data.msg);
                    else {
                        surl(res2.data.url);
                        let sz = 0;
                        let fileMetaData = [];
                        if (!res2.data.files.length) {
                            sz = res2.data.files.size;
                            fileMetaData.push({
                                name: res2.data.files.name
                            });
                            const data = {
                                files: fileMetaData,
                                url: res2.data.url,
                                totalSize: sz
                            };
                            saveLS(data);
                        }
                        else {
                            res2.data.files.map(file => {
                                sz += file.size;
                                fileMetaData.push({
                                    name: file.name,
                                });
                            });
                            const data = {
                                files: fileMetaData,
                                url: res2.data.url,
                                totalSize: sz
                            };
                            saveLS(data);
                        }
                    }

                    isld(false);
                });
        } catch (err) {
            console.log(err);
        }
    };

    const deleteFile = inn => {
        setFile(file.filter(ff => ff.lastModified != inn));
        sz -= file.filter(ff => ff.lastModified == inn)[0].size;
    };

    const clearPass = () => {
        setPass(!pass);
        updPass("");
    };
    function Toggle() {
        var temp = document.getElementById("pass");
        if (temp.type === "password") {
            temp.type = "text";
        }
        else {
            temp.type = "password";
        }
    }
    if (url) {
        path = `${window.location.href}download/${url}`;
        return <URL url={path} />;
    }

    return (
        <Fragment>
        {err && <h3>{err}</h3>}
        <form onSubmit={handleSubmit}>
        <div className="container">
        <div {...getRootProps({className: 'dropzone'})} onChange={handleChange}>
        <input {...getInputProps()} />
        <p>Drop Files here.</p>

        {file.map(fl => {
            if (fl.lastModified) {
                return (
                    <>
                    <h4>
                    {fl.name}{" "}
                    <span>
                    {" "}
                    {bytesToMegaBytes(fl.size)} MB{" "}
                    </span>
                    <span
                    id="close"
                    onClick={e=> {
                        e.stopPropagation();
                        deleteFile(fl.lastModified)
                    }
                    }
                    >
                    {" "}
                    X{" "}
                    </span>
                    </h4>
                    </>
                );
            }
        })}
        </div>
        </div>
        <Progress percentage={!err ? uploadPercentage : 0} />

        <br />

        <label>Expires after {"  "}</label>


        <select id="exp" name="exp" onChange={e => setExp(e.target.value)}>
        <option value="5">5 Minutes</option>
        <option value="30">30 Minutes</option>
        <option value="60">1 Hour</option>
        <option value="150">2.5 Hours</option>
        </select>
        <label>
        {"  "} OR {"  "}
        </label>
        <select id="dwn" name="dwn" onChange={e => setdwn(e.target.value)}>
        <option value="1">1 Download</option>
        <option value="3">3 Downloads</option>
        <option value="5">5 Downloads</option>
        <option value="10">10 Downloads</option>
        </select>
        <br />

        <input
        type="checkbox"
        name="check"
        onChange={() => clearPass()}
        onClick={Toggle}
        />
        <label>Password Protect</label>
        <br />


        <div id="pass">
        <InputGroup
        id="pass"
        fill={true}
        disabled={!pass}
        small={true}
        placeholder="Password"
        rightElement={lockButton}
        type={showPassword ? "text" : "password"}
        onChange={e => updPass(e.target.value)}
        />
        </div>

        <br />
        <h3>{sz == 0.0 ? 0 : bytesToMegaBytes(sz)} MB</h3>
        <input type="submit" value="Upload" />
        </form>

        </Fragment>
    );
};

export default FileUpload;
