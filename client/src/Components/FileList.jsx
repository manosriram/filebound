import React, { Fragment, useEffect }from "react";

const FileList = props => {
    useEffect(() => {
        console.log(props);
    }, []);

    const hi = () => {
        for (let t=0;t<props.list.length;++t) console.log(props.list[t]);
    };

    const deleteFile = file => {
    
    };

    return (
        <Fragment>
            {props.list.map((fl, id) => {
                return (
                    <div id={id}>
                        <h3>{fl.name}
                        <button onClick={() => deleteFile(fl, id)}>Remove</button>
                    </h3>
                    
                    </div>
                );
            })}
        </Fragment>
    );
};

export default FileList;
