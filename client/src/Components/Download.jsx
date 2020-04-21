import React, { Fragment, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
const base = "https://reservebckt.s3.ap-south-1.amazonaws.com/";

const Download = () => {
    const [url, surl] = useState("");
    const [names, setNames] = useState([]);
    let loc = useLocation();

    React.useEffect(() => {
        let ph = loc.pathname.split("/")[2];
        listFiles(ph);
        surl(base + ph + ".zip");
    }, []);

    const listFiles = async url => {
        const resp = await fetch("/file/list", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({url: url})
        });
        const data = await resp.json();
        setNames(data.names);
    };

    return (
        <Fragment>
        <input type="text" placeholder="URL" name="url" />
        <br />
        {names.map(name => {
            return (
                <Fragment>
                    <h4 onClick={() => console.log(name)}>{name}</h4>
                </Fragment>
            );
        }
        )}
        <a href={url}>down</a>
        </Fragment>
    );
};

export default Download;
