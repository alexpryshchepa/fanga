import React, { Fragment } from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';
import Page from 'components/Page';
import Button from '@material-ui/core/Button';
import Loading from 'components/Loading';
import Activities from 'components/Activities';
import Activity from 'components/Activity';
import Map from 'components/Map';
import queryString from 'query-string';
import { byType, byBound } from 'utils/activityFilters';
import kyivBorder from 'data/geo/ukraine/kyiv/border.json';
import {
  getAccessToken,
  getAthleteActivities,
  clearAthleteActivities,
} from 'actions/strava';
import s from './profile.scss';

class Profile extends React.Component {
  mapRef = React.createRef();
  profileRef = React.createRef();

  componentDidMount() {
    const parsedHref = queryString.parse(window.location.href);

    if (parsedHref.code) {
      this.props.getAccessToken(parsedHref.code).then(() => {
        this.props.getAthleteActivities();
      }).catch(() => {
        Router.push('/error');
      });
    } else {
      Router.push('/error');
    }
  }

  render() {
    const { authorization, activities, fetchingActivity } = this.props;
    const filteredActivities = activities.data ? byBound(byType(activities.data, 'Run'), kyivBorder.features[0].geometry.coordinates) : null;

    return (
      <Page>
        <div className={s.root}>
          {
            authorization.loaded ? (
              <div className={s.container}>
                <div className={s.map}>
                  <Map ref={this.mapRef} />
                </div>
                <div className={s.profile} ref={this.profileRef}>
                  {!this.props.activity.active ? (
                    <Fragment>
                      <div className={s.athlete}>
                        <h2 className={s.title}>Атлет:</h2>
                        <div className={s.avatar}>
                          <img src={authorization.data.athlete.profile} alt="avatar" />
                        </div>
                        <div className={s.info}>
                          <div className={s.infoRow}>
                            Имя:{' '}
                            <span>{`${authorization.data.athlete.firstname} ${authorization.data.athlete.lastname}`}</span>
                          </div>
                          <div className={s.infoRow}>
                            Город:{' '}
                            <span>{authorization.data.athlete.city}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className={s.titleWithButton}>
                          <h2>Беговые активности:</h2>
                          <div title="Мы автоматически обновляем ваши активности один раз в день.">
                            <Button variant="contained" color="secondary" onClick={() => {
                              this.props.clearAthleteActivities();
                              this.props.getAthleteActivities();
                            }} disabled={!activities.loaded || fetchingActivity.loading}>
                              Обновить
                            </Button>
                          </div>
                        </div>

                        {!activities.error ? (
                          <Fragment>
                            <div className={s.activities}>
                              {!activities.loaded && (
                                <div className={activities.data && activities.data.length ? s.activitiesLoaderCover : s.activitiesLoader}>
                                  <span>Загружаем активности, подождите...</span>
                                  <div className={s.activitiesSpinner}>
                                    {!activities.loaded && <Loading color="#fff" size="32" />}
                                  </div>
                                </div>
                              )}
                              <div className={s.activitiesData}>
                                {filteredActivities && filteredActivities.length && <Activities activities={filteredActivities} map={{
                                  goToViewport: this.mapRef.current.goToViewport,
                                }} profileRef={this.profileRef} />}
                              </div>
                            </div>
                            {activities.loaded && !filteredActivities.length && <div className={s.activitiesEmpty}>Пусто. Надеемся что ты хотя бы педали крутишь.</div>}
                          </Fragment>
                        ) : (
                          <div className={s.activitiesError}>
                            Извините, мы не можем получить ваши активности. Скорее всего сервис перегружен. Возвращайтесь через 15 минут.
                          </div>
                        )}
                      </div>
                    </Fragment>
                  ) : <Activity map={{
                    goToViewport: this.mapRef.current.goToViewport,
                  }} profileRef={this.profileRef} />}
                </div>
              </div>
            ) : (
              <div className={s.loading}>
                <Loading color="#fff" size="32" />
              </div>
            )
          }
        </div>
      </Page>
    );
  }
}

const mapState = state => ({
  authorization: state.strava.authorization,
  activities: state.strava.activities,
  activity: state.activity,
  fetchingActivity: state.strava.activity,
});

const mapDispatch = {
  getAccessToken,
  getAthleteActivities,
  clearAthleteActivities,
};

export default connect(
  mapState,
  mapDispatch,
)(Profile);
