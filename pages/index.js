import React from 'react';
import queryString from 'query-string';
import Page from 'components/Page';
import Button from '@material-ui/core/Button';
import config from 'config.js';
import s from './index.scss';

class Index extends React.Component {
  authorize = () => {
    const params = {
      client_id: config.strava.clientId,
      redirect_uri: config.strava.redirectURI,
      response_type: 'code',
      scope: 'activity:read_all',
    };

    window.location.replace(`https://www.strava.com/oauth/authorize?${queryString.stringify(params)}`);
  }

  render() {
    return (
      <Page>
        <div className={s.root}>
          <div className={s.content}>
            <h1 className={s.title}>Твоя карта беговых маршрутов</h1>
            <p className={s.text}>На основе данных о твоих беговых активностях из <a className={s.link} href="https://www.strava.com/" target="_blank">Strava</a> мы строим карту со всеми маршрутами которые ты пробежал в Киеве. В ближайшем времени мы введем систему оценки по которой можно будет узнать какой процент из всех самых популярных сегментов в городе ты пробежал, а так же рейтинг между бегунами.</p>
            <div className={s.button}>
              <Button variant="contained" color="primary" size="large" onClick={this.authorize}>
                Войти используя Strava
              </Button>
            </div>
          </div>
        </div>
      </Page>
    )
  }
}

export default Index;
