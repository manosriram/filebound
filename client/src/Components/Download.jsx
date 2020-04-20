import React, { Fragment, useState } from "react";
import axios from "axios";
const Download = () => {
    const handleSubmit = e => {
        e.preventDefault();
        const url = e.target.url.value;
        axios
            .post("/file/download", {
                url,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => console.log(res))
            .catch(err => console.log(err));
    };

    return (
        <Fragment>
            <form action="" onSubmit={handleSubmit} name="fmr">
                <input type="text" placeholder="URL" name="url" />
                <br />
                <br />
                <input type="submit" value="Download" />
            </form>
        </Fragment>
    );
};

export default Download;
