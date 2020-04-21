import React, { Fragment, useState } from "react";
import Download from "./Download";

const List = props => {
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
            <a href={props.url}>down</a>
        </Fragment>
    );
};

export default List;
