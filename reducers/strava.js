import {
  GET_TOKEN_SUCCESS,
  GET_TOKEN_ERROR,
  GET_ACTIVITIES_SUCCESS,
  GET_ACTIVITIES_COMPLETE,
  GET_ACTIVITIES_ERROR,
  CLEAR_ACTIVITIES_COMPLETE,
  GET_ACTIVITY_SUCCESS,
  GET_ACTIVITY_ERROR,
  GET_ACTIVITY_START,
  CLEAR_ACTIVITY_ERROR,
} from '../constants';
import _merge from 'lodash/merge';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';

const initialState = {
  authorization: {
    loaded: false,
    data: null,
    error: false,
  },
  activities: {
    loaded: false,
    data: null,
    error: false,
  },
  activity: {
    id: null,
    loading: false,
    error: false,
  }
};

export default function strava(state = initialState, action) {
  switch (action.type) {
    case GET_TOKEN_SUCCESS: {
      return {
        ...state,
        authorization: {
          loaded: true,
          data: action.payload,
          error: false,
        },
      };
    }

    case GET_TOKEN_ERROR: {
      return {
        ...state,
        authorization: {
          loaded: false,
          data: null,
          error: true,
        },
      };
    }

    case GET_ACTIVITIES_SUCCESS: {
      if (!!state.activities.data) {
        return {
          ...state,
          activities: {
            loaded: false,
            data: [...state.activities.data, ...action.payload],
            error: false,
          },
        };
      }

      return {
        ...state,
        activities: {
          ...state.activities,
          data: action.payload,
        },
      };
    }
      
    case GET_ACTIVITIES_COMPLETE: {
      return {
        ...state,
        activities: {
          ...state.activities,
          loaded: true,
        },
      };
    }

    case GET_ACTIVITIES_ERROR: {
      return {
        ...state,
        activities: {
          loaded: false,
          data: null,
          error: true,
        },
      };
    }
      
    case CLEAR_ACTIVITIES_COMPLETE: {
      return {
        ...state,
        activities: {
          loaded: false,
          data: null,
          error: false,
        },
      };
    }
      
    case GET_ACTIVITY_START: {
      return {
        ...state,
        activity: {
          id: action.payload,
          loading: true,
          error: false,
        },
      };
    }
      
    case GET_ACTIVITY_SUCCESS: {
      const currentActivity = _find(state.activities.data, ['id', action.payload.id]);
      const currentActivityIndex = _findIndex(state.activities.data, ['id', action.payload.id]);
      const updatedActivity = _merge(currentActivity, _merge(action.payload, {
        isFull: true,
      }));
      const updatedActivities = [...state.activities.data];
      updatedActivities[currentActivityIndex] = updatedActivity;

      return {
        ...state,
        activities: {
          ...state.activities,
          data: updatedActivities,
        },
        activity: {
          id: null,
          loading: false,
          error: false,
        },
      };
    }

    case GET_ACTIVITY_ERROR: {
      return {
        ...state,
        activity: {
          id: action.payload,
          loading: false,
          error: true,
        },
      };
    }

    case CLEAR_ACTIVITY_ERROR: {
      return {
        ...state,
        activity: {
          id: null,
          loading: false,
          error: false,
        },
      };
    }

    default: {
      return state;
    }
  }
}
