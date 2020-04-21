import React, { Fragment, useState } from "react";
import Download from "./Download";

const List = props => {

    const handleDownload = async () => {
        const resp = await fetch("/file/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.half })
        });
        const data = await resp.json();
    };
    return (
        <Fragment>
            {props.names.map(name => {
                return (
                    <Fragment>
                        <h4 onClick={() => console.log(name)}>{name}</h4>
                    </Fragment>
                );
            })}
            <br />
            <a href={props.url} onClick={handleDownload}>down</a>
        </Fragment>
    );
};

export default List;
