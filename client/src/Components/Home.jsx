import React from "react";
import "./App.css";
import FileUpload from "./FileUpload";

const Home = () => {
    const getFile = async () => {
        const resp = await fetch("/file/getFiles");
        const data = await resp.json();
        document.write(JSON.stringify(data));
    };
    return (
        <>
            <FileUpload />
            <br />
            <br />
            <br />
            <button onClick={getFile}>GET</button>
        </>
    );
};

export default Home;
