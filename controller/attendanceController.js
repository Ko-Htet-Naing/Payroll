const moment = require("moment");
const { Attendance, Users } = require("../models");

// const getAttendance = async (req, res) => {
//   const pageAsNumber = Number.parseInt(req.query.page);
//   const sizeAsNumber = Number.parseInt(req.query.size);
//   const dateQuery = req.query?.date;
//   let attendanceWithCount = undefined;

//   let page = 0;
//   if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
//     page = pageAsNumber;
//   }

//   // show 10 attendances
//   let size = 10;
//   if (
//     !Number.isNaN(sizeAsNumber) &&
//     !(sizeAsNumber > 10) &&
//     !(sizeAsNumber < 1)
//   ) {
//     size = sizeAsNumber;
//   }

//   // filter by date
//   if (dateQuery) {
//     attendanceWithCount = await Attendance.findAndCountAll({
//       where: {
//         date: dateQuery,
//       },
//       limit: size,
//       offset: page * size,
//     });
//   } else {
//     attendanceWithCount = await Attendance.findAndCountAll({
//       limit: size,
//       offset: page * size,
//     });
//   }

//   // pagination

//   res.send({
//     // attendance: attendanceWithCount,
//     content: attendanceWithCount.rows,
//     totalPages: Math.ceil(attendanceWithCount.count / Number.parseInt(size)),
//   });
// };

// const getAttendance = async (req, res) => {
//   try {
//     const { date, username, page = 1, limit = 10 } = req.query;

//     // Construct the where clause based on the query parameters
//     const whereClause = {};
//     if (date) {
//       whereClause = {date:{ [Op.iLike]: `%${date}%` }};
//       // whereClause[Op.or] = [
//       //   { intime: { [Op.iLike]: `%${search}%` } },
//       //   { outtime: { [Op.iLike]: `%${search}%` } },
//       //   { date: { [Op.iLike]: `%${search}%` } }
//       // ];
//     }
//     if (username) {
//       whereClause["$User.username$"] = { [Op.iLike]: `%${username}%` };
//     }

//     // Retrieve total count of records (for pagination)
//     const totalCount = await Attendance.count({ include: [{ model: Users }] });

//     // Retrieve attendance records and include the associated user information with pagination
//     const attendance = await Attendance.findAll({
//       include: [{ model: Users, attributes: ["username"] }],
//       where: whereClause,
//       offset: (page - 1) * limit,
//       limit: limit,
//     });

//     // Format the response data
//     const formattedAttendance = attendance.map((record) => ({
//       id: record.id,
//       in_time: record.in_time,
//       out_time: record.out_time,
//       date: record.date,
//       user: record.Users, // Include the associated user information
//     }));

//     // Respond with the formatted attendance data and total count for pagination
//     res.json({ attendance: formattedAttendance, totalCount });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const getAttendance = async (req, res) => {
  const listOfAttendance = await Attendance.findAll({
    include: [{ model: Users }],
  });
  console.log("listOfAttendance", listOfAttendance);

  const formattedAttendance = listOfAttendance.map((record) => ({
    id: record.id,
    in_time: record.in_time,
    out_time: record.out_time,
    date: record.date,
    user: { data: record.Users },
  }));

  res.json(formattedAttendance);
};

const createAttendance = async (req, res) => {
  console.log("time", moment().format("MMMM Do YYYY, h:mm:ss a"));
  try {
    const { in_time, out_time, date, UserId } = req.body;

    const beginningTime = moment("08:45", "HH:mm");
    const endTime = moment("16:45", "HH:mm");
    const timeLimit = 0;

    //convert inTime and outTime to moment objects
    const inTimeMoment = moment(in_time, "HH:mm:ss");
    const outTimeMoment = moment(out_time, "HH:mm:ss");

    //calculate latInTime and earlyOutTime
    const lateInTime = inTimeMoment.isAfter(beginningTime)
      ? inTimeMoment.diff(beginningTime, "minutes")
      : 0;

    console.log(lateInTime);
    const earlyOutTime = outTimeMoment.isBefore(endTime)
      ? endTime.diff(outTimeMoment, "minutes")
      : 0;

    console.log(earlyOutTime);

    if (lateInTime <= timeLimit && earlyOutTime <= timeLimit) {
      const newAttendance = await Attendance.create({
        in_time,
        out_time,
        date,
        UserId,
      });

      if (!newAttendance) return res.status(404).send("Attendance not found");

      res.json({ message: "attendance created" });
    } else {
      res.json({ message: "absent" });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = { createAttendance, getAttendance };
