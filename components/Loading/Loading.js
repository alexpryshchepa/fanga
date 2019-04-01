import React, { Component } from 'react';
import s from './Loading.scss';

class Loading extends Component {
  render() {
    const { size, color } = this.props;

    return (
      <div className={s.root}>
        <span
          className={s.spinner}
          style={{
            width: `${size || 24}px`,
            height: `${size || 24}px`,
            borderColor: color || '#000',
            borderRightColor: 'transparent',
          }}
        />
      </div>
    );
  }
}

export default Loading;
