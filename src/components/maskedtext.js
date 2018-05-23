import React from 'react';
import { Button, Intent } from '@blueprintjs/core';

class MaskedText extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isMasked: true
        };
    }

    render() {
        return (
            <span>
                <span style={{ fontStyle: this.state.isMasked ? "italic" : "normal" }}>{ this.state.isMasked ? "Content hidden" : this.props.text }</span>
                <Button className="db-margin-left-small db-button-focus pt-minimal pt-small" text={ this.state.isMasked ? "Show" : "Hide" } intent={ Intent.PRIMARY } onClick={(e) => { this.setState(prevState => ({ isMasked: !prevState.isMasked })) }} />
            </span>
        )
    }
}

export default MaskedText;