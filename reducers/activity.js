import {
  SET_CURRENT_ACTIVITY,
  ACTIVATE_CURRENT_ACTIVITY,
} from '../constants';

const initialState = {
  active: false,
  current: null,
};

export default function intl(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_ACTIVITY: {
      return {
        ...state,
        current: action.payload,
      };
    }

    case ACTIVATE_CURRENT_ACTIVITY: {
      return {
        ...state,
        active: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}
