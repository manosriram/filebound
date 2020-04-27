import React, { Fragment } from 'react';
import './App.css';

const Downloaded = () => {
    return (
        <Fragment>
            <div id="downloaded">
                <h2>Download Complete!
                    <br />
                    <a href="/">Try uploading some new files?</a>
                </h2>
            </div>
        </Fragment>
    );
};

export default Downloaded;
