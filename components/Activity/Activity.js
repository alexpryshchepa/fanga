import React, { Component } from 'react';
import * as helpers from 'helpers';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { setCurrentActivity, activateCurrentActivity } from 'actions/activity';
import kyivBorder from 'data/geo/ukraine/kyiv/border.json';
import s from './Activity.scss';

class Activity extends Component {
  close = () => {
    const { map, profileRef } = this.props;

    this.props.setCurrentActivity(null);
    this.props.activateCurrentActivity(false);

    const revertedKyivBorder = kyivBorder.features[0].geometry.coordinates.map(coords => {
      return [...coords].reverse();
    });

    map.goToViewport(revertedKyivBorder);

    profileRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  render() {
    const { activity } = this.props;
    
    const getDistance = distance => `${helpers.metersToKm(distance)} км`;
    const getPace = (time, distance) => `${helpers.calculatePace(time, distance)} мин. / км`;
    const getMovingTime = time => {
      const { hour, min, sec } = helpers.secondsToTime(time);
      return `${hour ? `${hour} ч. ${min} мин.` : `${min} мин. ${sec} сек.`}`;
    }
    const getElevation = elevation => `${elevation} м`;

    return (
      <div className={s.root}>
        <div className={s.content}>
          {!!activity.photos.primary && (
            <img className={s.photo} src={activity.photos.primary.urls['600']} />
          )}
          <h3 className={s.title} title={activity.name}>{activity.name}</h3>
          {!!activity.description && (
            <p className={s.desc}>{activity.description}</p> 
          )}
          <div className={s.info}>
            <p className={s.infoRow} title={getDistance(activity.distance)}>
              <span>Дистанция: </span>
              {getDistance(activity.distance)}
            </p>
            <p className={s.infoRow} title={getPace(activity.moving_time, activity.distance)}>
              <span>Тэмп: </span>
              {getPace(activity.moving_time, activity.distance)}
            </p>
            <p className={s.infoRow} title={getMovingTime(activity.moving_time)}>
              <span>Время: </span>
              {getMovingTime(activity.moving_time)}
            </p>
            <p className={s.infoRow} title={getElevation(activity.total_elevation_gain)}>
              <span>Набор высоты: </span>
              {getElevation(activity.total_elevation_gain)}
            </p>
          </div>
          {!!activity.device_name && (
            <div className={s.device}><span>Устройство:</span> {activity.device_name}</div> 
          )}
          {!!activity.gear && (
            <div className={s.gear}><span>Обувь:</span> {activity.gear.name}</div> 
          )}
          {!!activity.laps && (
            <div className={s.laps}>
              {activity.laps.map(({ name, moving_time, distance, average_heartrate, max_heartrate }) => {
                return (
                  <div className={s.lap}>
                    <h4>{name}</h4>
                    <ul>
                      <li><span>Дистанция:</span> {getDistance(distance)}</li>
                      <li><span>Тэмп: </span> {getPace(moving_time, distance)}</li>
                      <li><span>Время:</span> {getMovingTime(moving_time)}</li>
                      {!!average_heartrate && <li><span>Средний пульс:</span> {Math.round(average_heartrate)}</li>}
                      {!!max_heartrate && <li><span>Максимальный пульс:</span> {Math.round(max_heartrate)}</li>}
                    </ul>
                  </div>
                );
              })}
            </div> 
          )}
          <div className={s.button}>
            <Button variant="contained" color="primary" onClick={this.close}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  activity: state.activity.current,
});

const mapDispatch = {
  setCurrentActivity,
  activateCurrentActivity,
};

export default connect(mapState, mapDispatch)(Activity);
