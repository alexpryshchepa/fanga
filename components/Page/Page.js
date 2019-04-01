import React, { Component, Fragment } from 'react';
import styles from 'styles/global.scss';

class Page extends Component {
  render() {
    const { children } = this.props;

    return (
      <Fragment>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {children}
      </Fragment>
    );
  }
}

export default Page;
