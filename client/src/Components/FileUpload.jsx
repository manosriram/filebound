import React, { Fragment, useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState([]);
    const [filename, setFilename] = useState("");
    const [exp, setExp] = useState(0);
    const handleChange = e => {
        if (e.target.files) {
            setFile(e.target.files);
            setFilename(e.target.files[0].name);
        } else {
            setExp(e.target.value);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const fd = new FormData();
        for (let t=0;t<file.length;++t)
            fd.append("files", file[t]);

        fd.append("expires", exp);
        try {
            const resp = axios.post("/file/upload", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }).then(res2 => document.write(JSON.stringify(res2.data)));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit} onChange={handleChange}>
                <input type="file" multiple="multiple"/>
                <br />
                <input type="number" name="exp"/>
                <br />
                <input type="submit" value="Upload" />
            </form>
        </Fragment>
    );
};

export default FileUpload;
