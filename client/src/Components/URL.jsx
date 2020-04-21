import React, { Fragment, useState } from "react";
import axios from "axios";
import "./App.css";

const URL = props => {
    return (
        <Fragment>
            <h3>{props.url}</h3>
        </Fragment>
    );
}

export default URL;
