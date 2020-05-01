import React, { useState, Fragment } from "react";
import {
    Tooltip,
    Icon,
    Divider,
    Popover,
    Card,
    Elevation,
    MenuItem,
    Menu,
    Position,
    Button
} from "@blueprintjs/core";
import { FocusStyleManager } from "@blueprintjs/core";
const ClipboardJS = require("clipboard");
var clipboard = new ClipboardJS("#copy");
var moment = require("moment");

const bytesToMegaBytes = bytes => {
    return (bytes / (1024 * 1024)).toFixed(3);
};

const Local = props => {
    FocusStyleManager.onlyShowFocusOnTabs();
    const [time, setTime] = useState([]);
    const [isEmpty, setEmpty] = useState(undefined);

    window.addEventListener(
        "storage",
        function() {
            try {
                const nowData = JSON.parse(localStorage.getItem("session"));
                if (nowData.length != 0) setEmpty(false);
                else setEmpty(true);
            } catch (err) {
                console.log(err);
            }
        },
        false
    );

    React.useEffect(() => {
        try {
            let updatedData = [];
            const data = JSON.parse(localStorage.getItem("session"));
            updatedData = data.filter(
                file =>
                    file.expires > new Date().getTime() && file.downloads > 0
            );
            localStorage.setItem("session", JSON.stringify(updatedData));
        } catch (err) {
            console.log(err);
        }
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            if (JSON.parse(localStorage.getItem("session")).length == 0)
                setEmpty(true);
            else setEmpty(false);
            setTime([]);
        }, 1000);
    });

    if (!props.data.length || isEmpty) {
        return (
            <div id="right">
                <div id="tech-info">
                    <div id="title">
                        <h1>
                            <strong>File Sharing made private.</strong>
                        </h1>
                    </div>
                    <div id="det">
                        <h2>
                            Share files with a timeout link. The files you share
                            are end-to-end encrypted which means that the
                            original contents of the file can be seen only when
                            you download them!
                        </h2>
                    </div>
                    <br />
                    <div id="blog">
                        <h2>
                            To know more, check this{" "}
                            <a href="http://manosriram.xyz/show-posts">blog</a>{" "}
                            out.
                        </h2>
                    </div>
                </div>
                <br />
                <h3 id="link">
                    <a href="https://github.com/manosriram/reserve">Github</a>{" "}
                </h3>
            </div>
        );
    } else {
        return (
            <Fragment>
                {props.data.map((lst, inx) => {
                    const now = new Date().getTime();
                    const expires = lst.expires;
                    const hours = moment.duration(expires - now).hours(),
                        minutes = moment.duration(expires - now).minutes(),
                        seconds = moment.duration(expires - now).seconds();
                    if (lst.expires > now && lst.downloads > 0) {
                        return (
                            <div key={inx} id="uponRoot">
                                <div id="upon">
                                    <div id="remaining">
                                        <p id="rem">
                                            Expires in {"  "}
                                            <strong>
                                                {hours < 10
                                                    ? "0" + hours
                                                    : hours}
                                                :
                                                {minutes < 10
                                                    ? "0" + minutes
                                                    : minutes}
                                                :
                                                {seconds < 10
                                                    ? "0" + seconds
                                                    : seconds}
                                            </strong>
                                            {"  "} or after{" "}
                                            <strong>
                                                {lst.downloads} download{" "}
                                                {lst.downloads > 1 ? "s" : ""}
                                            </strong>
                                        </p>
                                    </div>
                                    {lst.files.length && (
                                        <>
                                            <div
                                                id="mm"
                                                class="bp3-dark bp3-card "
                                            >
                                                <h5
                                                    id="archive"
                                                    class="bp3-heading"
                                                >
                                                    <Icon icon="document" />
                                                    {"  "}
                                                    Archive.zip{" "}
                                                    <p id="size">
                                                        {bytesToMegaBytes(
                                                            lst.totalSize
                                                        )}{" "}
                                                        MB
                                                    </p>
                                                </h5>
                                                <Popover
                                                    content={lst.files.map(
                                                        ln => (
                                                            <>
                                                                <Menu
                                                                    text={
                                                                        ln.name
                                                                    }
                                                                >
                                                                    {ln.name}
                                                                </Menu>
                                                                <Divider />
                                                            </>
                                                        )
                                                    )}
                                                    position={Position.BOTTOM}
                                                >
                                                    <Button
                                                        id="filelist"
                                                        icon="chevron-down"
                                                        text={
                                                            lst.files.length +
                                                            " file" +
                                                            (lst.files.length >
                                                            1
                                                                ? "s"
                                                                : "")
                                                        }
                                                    />
                                                </Popover>
                                                <a
                                                    id="down"
                                                    href={"download/" + lst.url}
                                                >
                                                    <Icon
                                                        icon="cloud-download"
                                                        iconSize={30}
                                                    />
                                                </a>
                                                <Popover
                                                    id="down"
                                                    content="Copied!"
                                                    position={Position.RIGHT}
                                                >
                                                    <Tooltip
                                                        position={
                                                            Position.RIGHT
                                                        }
                                                    >
                                                        <Icon
                                                            data-clipboard-text={
                                                                window.location
                                                                    .href +
                                                                "download/" +
                                                                lst.url
                                                            }
                                                            id="copy"
                                                            icon="duplicate"
                                                            iconSize={25}
                                                        />
                                                    </Tooltip>
                                                </Popover>
                                            </div>
                                        </>
                                    )}
                                    <br />
                                </div>
                            </div>
                        );
                    }
                })}
            </Fragment>
        );
    }
};

export default Local;
