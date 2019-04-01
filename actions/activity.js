import {
  SET_CURRENT_ACTIVITY,
  ACTIVATE_CURRENT_ACTIVITY,
} from '../constants';

export function setCurrentActivity(id) {
  return {
    type: SET_CURRENT_ACTIVITY,
    payload: id,
  }
}

export function activateCurrentActivity(state) {
  return {
    type: ACTIVATE_CURRENT_ACTIVITY,
    payload: state,
  }
}
