import { FocusStyleManager } from "@blueprintjs/core";
import {
    Popover,
    Position,
    Menu,
    MenuItem,
    Icon,
    Checkbox,
    Tooltip,
    Intent,
    Button,
    InputGroup
} from "@blueprintjs/core";
import { useDropzone } from "react-dropzone";
import React, { Fragment, useState } from "react";
import axios from "axios";
import URL from "./URL";
import { useLocation } from "react-router-dom";
import Progress from "./Progress";
import Local from "./Local";
import "./FileMain.css";
import './Media.css'
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
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
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

    const style = {
        width: uploadPercentage + '%'
    };

    const lockButton = (
        <Tooltip
            content={`${showPassword ? "Hide" : "Show"} Password`}
            disabled={!pass}
        >
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
                        } else {
                            res2.data.files.map(file => {
                                sz += file.size;
                                fileMetaData.push({
                                    name: file.name
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

    const navStyle = {
        margin: "0 auto",
        width: "480px"
    };

    const clearPass = () => {
        setPass(!pass);
        updPass("");
    };
    function Toggle() {
        var temp = document.getElementById("pass");
        if (temp.type === "password") {
            temp.type = "text";
        } else {
            temp.type = "password";
        }
    }
    if (url) {
        path = `${window.location.href}download/${url}`;
        return <URL url={path} />;
    }
const expiryMenu  = (
            <Menu>
                <MenuItem text="5 Minutes" onClick={() => setExp(5)}/>
                <MenuItem text="30 Minutes" onClick={() => setExp(30)}/>
                <MenuItem text="1 Hour" onClick={() => setExp(60)}/>
                <MenuItem text="2.5 Hours" onClick={() => setExp(150)}/>
            </Menu>
        );
const downloadMenu = (
            <Menu>
                <MenuItem text="1 Download" onClick={() => setdwn(1)}/>
                <MenuItem text="3 Downloads" onClick={() => setdwn(3)}/>
                <MenuItem text="5 Downloads" onClick={() => setdwn(5)}/>
                <MenuItem text="10 Downloads" onClick={() => setdwn(10)}/>
            </Menu>
        );
    return (
        <Fragment>
            {err && <h3>{err}</h3>}
            <div id="container">
        <div id="left">
                <div id="box">
                    <div
                        {...getRootProps({ className: "dropzone" })}
                        onChange={handleChange}
                    >
                        <input {...getInputProps()} />
                        {!file.length && (
                            <div id="add">
                                <h3>Drag or click to add files upto 500MB.</h3>
                                <br />
                                <Icon icon="add" iconSize={30} />
                            </div>
                        )}

                        {file.map(fl => {
                            if (fl.lastModified) {
                                return (
                                    <div id="file-card">
                                        <div
                                            id="card-name"
                                            class="bp3-card bp3-dark "
                                        >
                                            <span>
                                                <Icon
                                                    color="blue"
                                                    id="doc"
                                                    icon="document"
                                                    iconSize={30}
                                                />
                                            </span>
                                            <h4>
                                                {fl.name}
                                                <span>
                                                    <Icon
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            deleteFile(
                                                                fl.lastModified
                                                            );
                                                        }}
                                                        id="crs"
                                                        icon="cross"
                                                        iconSize={30}
                                                    />
                                                </span>
                                            </h4>
                                            <h5>
                                                {bytesToMegaBytes(fl.size)} MB
                                            </h5>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                    <h3 id="size"><code>{bytesToMegaBytes(sz)} MB</code></h3>
                </div>
                <form id="submitForm" onSubmit={handleSubmit}>
                    <div class="bp3-progress-bar bp3-intent-primary">
                          <div class="bp3-progress-meter" style={style}></div>
                    </div>
                          {uploadPercentage} %
                    <br />

                    <strong><label id="expires">Expires after {"  "}</label></strong>
                    <div id="tools">
        
                        <Popover className="bp3-dark" content={expiryMenu} position={Position.BOTTOM}>
                            <Button icon="time" text={exp > 30 ? (exp/60 + " Hour" + ((exp/60)==1 ? "" : "s")) : exp + " Minutes"} />
                        </Popover>

                        <label>
                            {"  "} <strong>OR</strong> {"  "}
                        </label>


                        <Popover className="bp3-dark" content={downloadMenu} position={Position.BOTTOM}>
                            <Button icon="download" text={dwn > 1 ? (dwn + " Downloads") : (dwn + " Download")} />
                        </Popover>

                        <br />
                        <br />

                        <Checkbox
                            id="passCheck"
                            label="Password Protect URL"
                            onChange={() => clearPass()}
                            onClick={Toggle}
                        />
                        <div id="pass">
                            <InputGroup
                                id="pass"
                                fill={true}
                                disabled={!pass}
                                small={false}
                                placeholder="Password"
                                leftElement={lockButton}
                                type={showPassword ? "text" : "password"}
                                onChange={e => updPass(e.target.value)}
                            />
                        </div>
                        <br />
                        <br />
                    </div>
        <div className="bp3-dark">
                    <Button type="submit" icon="upload" text="Upload" />
        </div>
                </form>
            </div>
        <div id="right">
            <Local data={getLS()} />
        </div>
        </div>
        </Fragment>
    );
};

export default FileUpload;
