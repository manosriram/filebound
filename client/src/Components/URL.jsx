import React, { Fragment, useState } from "react";
import axios from "axios";
import "./App.css";
import {
    Classes,
    Intent,
    Button,
    Icon,
    Position,
    Popover,
    Tooltip
} from "@blueprintjs/core";
const ClipboardJS = require("clipboard");
var clipboard = new ClipboardJS("#copy-url");

const URL = props => {
    return (
        <div id="info">
            <input id="url" type="text" value={props.url} />
            {"  "}
            <Popover intent="primary" content={<h2 id="copied">Copied!</h2>} position={Position.RIGHT}>
                <Tooltip content="Copy Link to clipboard" position={Position.RIGHT}>
                    <Icon
                        id="copy-url"
                        icon="duplicate"
                        iconSize={20}
                        data-clipboard-text={props.url}
                    />
                </Tooltip>
            </Popover>
        </div>
    );
};

export default URL;
