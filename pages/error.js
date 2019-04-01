import React from 'react';
import Page from 'components/Page';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import s from './error.scss';

class Error extends React.Component {
  render() {
    return (
      <Page>
        <div className={s.root}>
          <div className={s.content}>
            <h1 className={s.message}>Что-то пошло не так.</h1>

            <Link href="/">
              <Button variant="contained" color="secondary" size="large">
                Веруться на страницу входа
              </Button>
            </Link>
          </div>
        </div>
      </Page>
    );
  }
}

export default Error;
