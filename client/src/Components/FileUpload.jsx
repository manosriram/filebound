import React, { Fragment, useState } from "react";
import axios from "axios";
import FileList from "./FileList";
import "./App.css";

const FileUpload = () => {
    const [file, setFile] = useState([]);
    const [exp, setExp] = useState(5);
    const [url, surl] = useState("");

    const handleExp = e => {
        setExp(e.target.value);
    };

    const handleChange = e => {
        let fileList = [];
        fileList = e.target.files;
        for (let t = 0; t < fileList.length; ++t)
            setFile(file => [...file, fileList[t]]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const fd = new FormData();
        for (let t = 0; t < file.length; ++t) fd.append("files", file[t]);

        fd.append("expires", exp);
        try {
            const resp = axios
                .post("/file/upload", fd, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(res2 => surl(res2.data.url));
        } catch (err) {
            console.log(err);
        }
    };

    const deleteFile = inn => {
        setFile(file.filter(ff => ff.lastModified != inn));
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <input
                    id="files"
                    type="file"
                    multiple="multiple"
                    onChange={e => handleChange(e)}
                    className="hidden"
                />
                <label for="files" id="file_label">Select Files</label>
                <br />
                {file.map(fl => {
                    if (fl.lastModified) {
                        return (
                            <>
                                <h4>{fl.name}
                                <span id="close" onClick={() => deleteFile(fl.lastModified)}> X </span>
                                </h4>
                            </>
                        );
                    }
                })}
                <select id="" name="exp" onChange={handleExp}>
                    <option value="5">5 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="150">2.5 Hours</option>
                </select>
                <br />
                <input type="submit" value="Upload" />
            </form>

            {url && <h2>{url}</h2>}
        </Fragment>
    );
};

export default FileUpload;
