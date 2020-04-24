import React, { Fragment, useState } from "react";
import axios from "axios";
import "./App.css";
import URL from "./URL";
import { useLocation } from "react-router-dom";

const bytesToMegaBytes = bytes => {
    return (bytes / (1024 * 1024)).toFixed(3);
};

const FileUpload = () => {
    const [file, setFile] = useState([]);
    const [exp, setExp] = useState(5);
    const [url, surl] = useState("");
    const [pass, setPass] = useState(false);
    const [currPass, updPass] = useState("");
    const [dwn, setdwn] = useState(1);
    const [err, setErr] = useState("");
    const [ld, isld] = useState(false);
    let loc = useLocation();

    let path = "";
    const handleChange = e => {
        let fileList = [];
        fileList = e.target.files;
        for (let t = 0; t < e.target.files.length; ++t) {
            setFile(file => [...file, fileList[t]]);
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
                    }
                })
                .then(res2 => {
                    if (!res2.data.scs) setErr(res2.data.msg);
                    else surl(res2.data.url);

                    isld(false);
                });
        } catch (err) {
            console.log(err);
        }
    };

    const deleteFile = inn => {
        setFile(file.filter(ff => ff.lastModified != inn));
    };

    const clearPass = () => {
        setPass(!pass);
        updPass("");
    };

    if (ld) return <i className="fa fa-refresh fa-spin"></i>;

    if (url) {
        path = `${window.location.href}download/${url}`;
        return <URL url={path} />;
    }

    return (
        <Fragment>
            {err && <h3>{err}</h3>}
            <form onSubmit={handleSubmit}>
                <input
                    id="files"
                    type="file"
                    multiple="multiple"
                    onChange={e => handleChange(e)}
                    className="hidden"
                />
                <label for="files" id="file_label">
                    Select Files
                </label>
                <br />
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
                                        onClick={() =>
                                            deleteFile(fl.lastModified)
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
                <label>Expires after {"  "}</label>
                <select id="" name="exp" onChange={e => setExp(e.target.value)}>
                    <option value="5">5 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="150">2.5 Hours</option>
                </select>
                <label>
                    {"  "} OR {"  "}
                </label>
                <select id="" name="dwn" onChange={e => setdwn(e.target.value)}>
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
                />
                <label>Add Password</label>
                <br />

                {pass && (
                    <input
                        type="password"
                        name="pass"
                        onChange={e => updPass(e.target.value)}
                    />
                )}
                <br />
                <input type="submit" value="Upload" />
            </form>
        </Fragment>
    );
};

export default FileUpload;
