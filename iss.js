const request = require('request');
/**
 * Makes a single API request to retrieve the user's IP address
 * Input:
 *  - A callback (to pass back an error or the IP string)
 * Returns (via callback) :
 *  - An error, if any (nullable)
 *  - The IP address as a string (null if error). Example: "162.242.495.199"
 */
const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    callback(null, JSON.parse(body).ip);
  });
};

/**
 * Makes a single API request to retrieve the lat/lng for a given IPv4 address.
 * Input:
 *   - The ip (ipv4) address (string)
 *   - A callback (to pass back an error or the lat/lng object)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The lat and lng as an object (null if error). Example:
 *     { latitude: '49.27670', longitude: '-123.13000' }
 */
const fetchCoordsByIP = function(ip, callback) {
  request(`http://ipwho.is/${ip}`, function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }
    const data = JSON.parse(body);
    if (!data.success) {
      const message = `Success status was ${data.success}. Server message says ${data.message} when fetching for IP ${data.ip}`;
      callback(Error(message), null);
      return;
    }
    const lat = data.latitude;
    const lon = data.longitude;
    callback(null, {"latitude": lat, "longitude": lon});
  });
};
/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }
    const data = JSON.parse(body);
    if (data.message !== 'success') {
      const message = `Success status was ${data.message}. Response was ${data.response}.`;
      callback(Error(message), null);
      return;
    }
    const results = data.response;
    callback(null, results);
  });
};
/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, results) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, results);
      }) 
    })
  })
};

module.exports = { nextISSTimesForMyLocation };