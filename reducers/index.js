import { combineReducers } from 'redux';
import strava from './strava';
import activity from './activity';

export default combineReducers({
  strava,
  activity,
});
