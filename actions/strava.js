import {
  GET_TOKEN_SUCCESS,
  GET_TOKEN_ERROR,
  GET_ACTIVITIES_SUCCESS,
  GET_ACTIVITIES_COMPLETE,
  GET_ACTIVITIES_ERROR,
  CLEAR_ACTIVITIES_COMPLETE,
  SET_ACTIVITIES_COMPLETE,
  GET_ACTIVITY_SUCCESS,
  GET_ACTIVITY_ERROR,
  GET_ACTIVITY_START,
  CLEAR_ACTIVITY_ERROR,
} from '../constants';
import queryString from 'query-string';
import config from 'config.js';

const stravaApi = 'https://www.strava.com/api/v3';

export function getAccessToken(code, cb) {
  return dispatch => {
    const params = {
      client_id: config.strava.clientId,
      client_secret: config.strava.clientSecret,
      code,
      grant_type: 'authorization_code',
    };

    return new Promise(function(res, rej) {
      fetch(`https://www.strava.com/oauth/token?${queryString.stringify(params)}`, { method: 'POST' })
        .then(response => {
          if (response.ok) {
            response.json().then(parsedResponse => {
              dispatch({
                type: GET_TOKEN_SUCCESS,
                payload: parsedResponse,
              });
              
              res();
            });
          } else {
            dispatch({
              type: GET_TOKEN_ERROR,
            });
            
            rej();
          }
        });
    });
  }
}

const getAthleteActivitiesParams = {
  page: 1,
  per_page: 30,
};

export function getAthleteActivities() {
  const { page, per_page } = getAthleteActivitiesParams;
  const now = Date.now();
  const cache = localStorage.getItem('userActivities');
  const cacheExpireDate = localStorage.getItem('userActivitiesExpireDate');
  const isCacheExpired = now - cacheExpireDate > 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

  return (dispatch, getState) => {
    dispatch({
      type: CLEAR_ACTIVITY_ERROR,
    });

    if (!!cache && !isCacheExpired) {      
      dispatch({
        type: GET_ACTIVITIES_SUCCESS,
        payload: JSON.parse(cache),
      });

      dispatch({
        type: GET_ACTIVITIES_COMPLETE,
      });

      return;
    }

    if (getState().strava.authorization.loaded) {
      const { access_token } = getState().strava.authorization.data;

      fetch(`${stravaApi}/athlete/activities?${queryString.stringify(getAthleteActivitiesParams)}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(parsedResponse => {
              dispatch({
                type: GET_ACTIVITIES_SUCCESS,
                payload: parsedResponse,
              });

              const { activities } = getState().strava;

              if (activities.data.length === page * per_page) {
                getAthleteActivitiesParams.page += 1;
                dispatch(getAthleteActivities());
              } else {
                getAthleteActivitiesParams.page = 1;
                dispatch({
                  type: GET_ACTIVITIES_COMPLETE,
                });
                
                // Cache activities
                localStorage.setItem('userActivities', JSON.stringify(getState().strava.activities.data));
                localStorage.setItem('userActivitiesExpireDate', Date.now());
              }
            });
          } else {
            dispatch({
              type: GET_ACTIVITIES_ERROR,
            });
          }
        });
    } else {
      dispatch({
        type: GET_ACTIVITIES_ERROR,
      });
    }
  }
}

export function clearAthleteActivities() {
  localStorage.removeItem('userActivities');

  return {
    type: CLEAR_ACTIVITIES_COMPLETE,
  };
}

export function getAthleteActivity(id) {
  return (dispatch, getState) => {
    const { access_token } = getState().strava.authorization.data;

    dispatch({
      type: GET_ACTIVITY_START,
      payload: id,
    });

    return new Promise(function(res, rej) {
      fetch(`https://www.strava.com/api/v3/activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(parsedResponse => {
              dispatch({
                type: GET_ACTIVITY_SUCCESS,
                payload: parsedResponse,
              });

              // Cache activities
              localStorage.setItem('userActivities', JSON.stringify(getState().strava.activities.data));
              localStorage.setItem('userActivitiesExpireDate', Date.now());

              res(parsedResponse);
            });
          } else {
            dispatch({
              type: GET_ACTIVITY_ERROR,
              payload: id,
            });
            
            rej();
            
            setTimeout(() => {
              dispatch({
                type: CLEAR_ACTIVITY_ERROR,
              });
            }, 2000);
          }
        });
    });
  }
}
