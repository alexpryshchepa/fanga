import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import ReactMapGL, { SVGOverlay, FlyToInterpolator } from 'react-map-gl';
import polyline from '@mapbox/polyline';
import { point, polygon, booleanPointInPolygon, bbox, lineString } from '@turf/turf';
import WebMercatorViewport from 'viewport-mercator-project';
import { fromJS } from 'immutable';
import _merge from 'lodash/merge';
import _isEmpty from 'lodash/isEmpty';
import { byType, byBound } from 'utils/activityFilters';
import defaultMapStyle from 'data/defaultMapStyle.json';
import kyivBorder from 'data/geo/ukraine/kyiv/border.json';
import styleVars from 'styles/variables.scss';
import config from 'config.js';

const mapStyle = fromJS(defaultMapStyle)
  // Add geojson source to map
  .setIn(['sources', 'points'], {
    type: 'geojson',
    data: kyivBorder,
  })
  // Add point layer to map
  .set('layers', fromJS(defaultMapStyle).get('layers').push({
    "id": "kyiv_border",
    "type": "line",
    "source": "points",
    "paint": {
      "line-color": styleVars.colorPrimary,
      "line-width": 2,
      "line-dasharray": [2, 1]
    }
  }));

const filterActivities = activities => {
  const run = byType(activities, 'Run');
  const kyiv = byBound(run, kyivBorder.features[0].geometry.coordinates);

  return kyiv;
};

const getMapSize = () => {
  return {
    width: window.matchMedia('(min-width: 1024px)').matches ? (document.body.offsetWidth * 0.5) - 48 : document.body.offsetWidth - 48,
    height: window.matchMedia('(min-width: 1024px)').matches ? window.innerHeight - (48 * 2) : (window.innerHeight / 2) - (24 * 2),
  }
};

class Map extends Component {
  state = {
    viewport: {
      ...getMapSize(),
      latitude: 50.45466,
      longitude: 30.5238,
      zoom: 10,
    },
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps) {
    if (
      !_isEmpty(this.props.activities.data) &&
      prevProps.activities.data !== this.props.activities.data
    ) {
      this.filteredActivities = filterActivities(this.props.activities.data);
    }
  };

  handleResize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        ...getMapSize(),
      },
    });
  }

  drawSegments = ({ project }) => {
    if (!!this.filteredActivities) {
      const data = this.filteredActivities.filter(activity => {
        if (!activity.map || !activity.map.summary_polyline) {
          return false;
        }

        return true;
      }).map(activity => {
        const decodedRoute = polyline.decode(activity.map.polyline || activity.map.summary_polyline);
        const routeProjection = decodedRoute.map(coords => {
          return project(coords.reverse());
        });

        const polylineData = {
          id: activity.id,
          projection: routeProjection,
          style: {
            fill: 'none',
            stroke: styleVars.colorDark,
            strokeWidth: 2,
          },
        };

        if (!!this.props.activity && this.props.activity.id === activity.id) {
          return _merge(polylineData, {
            style: {
              stroke: styleVars.colorPrimary,
              strokeWidth: 4,
            },
          });
        }

        return polylineData;
      }).sort(data => !!this.props.activity && this.props.activity.id === data.id ? 1 : -1);

      return (
        <Fragment>
          {!_isEmpty(data) && data.map(({ id, projection, style }, index) => (
            <polyline key={id} points={projection} style={style} />
          ))}
        </Fragment>
      );
    }
    
    return null;
  }
  
  onViewportChange = viewport => this.setState({
    viewport: {
      ...this.state.viewport,
      ...viewport,
    },
  });

  goToViewport = bound => {
    const turfLine = lineString(bound);
    const [minLng, minLat, maxLng, maxLat] = bbox(turfLine);
    // construct a viewport instance from the current state
    const viewport = new WebMercatorViewport(this.state.viewport);
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [[minLat, minLng], [maxLat, maxLng]],
      { padding: 24 }
    );

    this.onViewportChange({
      longitude,
      latitude,
      zoom,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 2000,
    });
  };

  render() {
    return (
      <ReactMapGL
        {...this.state.viewport}
        mapboxApiAccessToken={config.mapbox.token}
        mapStyle={mapStyle}
        onViewportChange={this.onViewportChange}
      >
        <SVGOverlay redraw={this.drawSegments} />
      </ReactMapGL>
    );
  }
}

const mapState = state => ({
  activities: state.strava.activities,
  activity: state.activity.current,
});

export default connect(mapState, null, null, { forwardRef: true })(Map);