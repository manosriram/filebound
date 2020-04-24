import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const Progress = ({ percentage }) => {
    return (
        <Fragment>
            <div class="progress">
                <div>
                    {percentage} %
                </div>
            </div>
        </Fragment>
    )
};

Progress.propTypes = {
    percentage: PropTypes.number.isRequired
};

export default Progress;
