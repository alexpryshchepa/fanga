const config = {
  strava: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectURI: 'https://fanga.herokuapp.com/profile',
  },
  mapbox: {
    token: process.env.MAPBOX_TOKEN,
  }
};

export default config;
