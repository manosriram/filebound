import React, { Fragment, useState } from "react";
import Download from "./Download";

const Verify = props => {
    const [filePass, setFilePass] = useState("");
    const [valid, setValid] = useState(false);
    const [msg, setMSG] = useState("");

    React.useEffect(() => {
        console.log(props);
    }, []);

    const handleChange = e => {
        setFilePass(e.target.value);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const resp = await fetch("/file/verifyPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: props.url, password: filePass })
        });
        const data = await resp.json();
        setValid(data.valid);
        if (!data.valid) setMSG("Wrong Pass!");
    };

    if (valid) return <Download valid={true} />;
    else {
        return (
            <form action="" onSubmit={handleSubmit}>
                {msg}
                <input
                    type="password"
                    name="pass"
                    onChange={e => handleChange(e)}
                />
                <br />
                <input type="submit" value="Verify" />
            </form>
        );
    }
};

export default Verify;
