const { nextISSTimesForMyLocation } = require('./iss_promised');

const printPassTimes = function(passTimes) {
  for (let result of passTimes) {
    const date = new Date(0);
    date.setUTCSeconds(result.risetime);
    const duration = result.duration;
    console.log(`Next pass at ${date} for ${duration} seconds!`);
  }
};

nextISSTimesForMyLocation()
  .then((results) => {
    printPassTimes(results);
  })
  .catch((error) => {
    console.log("It didn't work: ", error.message);
  });