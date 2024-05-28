// const whiteList = ["http://localhost:3500", "http://127.0.0.1:5173", "*"];

// let corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not Allowed By CORS"));
//     }
//   },
//   optoinsSuccessStatus: 200,
// };
// module.exports = corsOptions;

let corsOptions = {
  origin: function (origin, callback) {
    // Always allow requests from any origin
    callback(null, true);
  },
  credential: true,
  optionsSuccessStatus: 200,
};
module.exports = corsOptions;
