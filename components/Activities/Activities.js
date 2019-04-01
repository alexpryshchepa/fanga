import React, { Component } from 'react';
import * as helpers from 'helpers';
import { connect } from 'react-redux';
import Loading from 'components/Loading';
import Button from '@material-ui/core/Button';
import polyline from '@mapbox/polyline';
import { setCurrentActivity, activateCurrentActivity } from 'actions/activity';
import { getAthleteActivity } from 'actions/strava';
import _find from 'lodash/find';
import s from './Activities.scss';

class Activities extends Component {
  handleMouseEnter = activity => {
    this.props.setCurrentActivity(activity);
  }

  handleMouseLeave = () => {
    if (!this.props.activity.active) {
      this.props.setCurrentActivity(null);
    }
  }

  goToActivity = id => {
    const { map, activities, profileRef } = this.props;

    const currentActivity = _find(activities, ['id', id]);

    const activateActivity = activity => {
      this.props.setCurrentActivity(activity);
      this.props.activateCurrentActivity(true);

      map.goToViewport(polyline.decode(activity.map.polyline));

      profileRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    if (currentActivity.isFull) {
      activateActivity(currentActivity);
    } else {
      this.props.getAthleteActivity(id).then(activity => {
        activateActivity(activity);
      });
    }
  }

  render() {
    const { activities, fetchingActivity } = this.props;

    return (
      <div className={s.root}>
        {activities.map(activity => {
          const distance = `${helpers.metersToKm(activity.distance)} км`;
          const pace = `${helpers.calculatePace(activity.moving_time, activity.distance)} мин. / км`;
          const { hour, min, sec } = helpers.secondsToTime(activity.moving_time);
          const movingTime = `${hour ? `${hour} ч. ${min} мин.` : `${min} мин. ${sec} сек.`}`;
          const elevation = `${activity.total_elevation_gain} м`;
          
          return (
            <div
              key={activity.id}
              className={s.activity}
              onMouseEnter={() => this.handleMouseEnter(activity)}
              onMouseLeave={() => this.handleMouseLeave()}
            >
              <div className={s.content}>
                <h3 className={s.title} title={activity.name}>{activity.name}</h3>
                <div className={s.info}>
                  <p className={s.infoRow} title={distance}>
                    <span>Дистанция: </span>
                    {distance}
                  </p>
                  <p className={s.infoRow} title={pace}>
                    <span>Тэмп: </span>
                    {pace}
                  </p>
                  <p className={s.infoRow} title={movingTime}>
                    <span>Время: </span>
                    {movingTime}
                  </p>
                  <p className={s.infoRow} title={elevation}>
                    <span>Набор высоты: </span>
                    {elevation}
                  </p>
                </div>
                <div className={s.button}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.goToActivity(activity.id)}
                    disabled={fetchingActivity.id === activity.id}
                  >
                    Детали
                  </Button>
                </div>
              </div>
              {fetchingActivity.id === activity.id && (
                <div className={s.loader}>
                  <Loading />
                </div>
              )}
              {fetchingActivity.id === activity.id && fetchingActivity.error && (
                <div className={s.error}>
                  Извините, не можем получить детали активности. Попробуйте позже.
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

const mapState = state => ({
  activity: state.activity,
  fetchingActivity: state.strava.activity,
});

const mapDispatch = {
  setCurrentActivity,
  activateCurrentActivity,
  getAthleteActivity,
};

export default connect(mapState, mapDispatch)(Activities);
