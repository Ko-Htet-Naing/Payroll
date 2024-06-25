const attendanceHelper = require("../helpers/AttendanceHelper");

const parseQueryParams = (req) => ({
  page: Math.max(0, Number.parseInt(req.query.page) || 0),
  size: Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10),
  username: req.query.username,
  fromDate: req.query.fromDate,
  toDate: req.query.toDate,
  position: req.query.position,
  department: req.query.department,
  employeeId: req.query.employeeId,
});

const getAttendance = async (req, res) => {
  const {
    page,
    size,
    username,
    fromDate,
    toDate,
    position,
    department,
    employeeId,
  } = parseQueryParams(req);

  try {
    const totalCount = await attendanceHelper.getTotalAttendanceCount();
    const attendanceList = await attendanceHelper.getAttendanceList({
      page,
      size,
      username,
      fromDate,
      toDate,
      position,
      department,
      employeeId,
    });

    const result = attendanceList.map((attendance) => ({
      id: attendance.id,
      in_time: attendance.in_time,
      out_time: attendance.out_time,
      late_in_time: attendance.late_in_time,
      early_out_time: attendance.early_out_time,
      date: attendance.date,
      userId: attendance.UserId,
      username: attendance.User.username,
      employeeId: attendance.User.EmployeeId,
      position: attendance.User.Position,
      departmentName: attendance.User.Department.deptName,
    }));

    //  if (!attendanceList) return res.status(404).json("Attendance not found");
    res.status(200).json({
      columns: [
        { Header: "Name", accessor: "username" },
        { Header: "Date", accessor: "date" },
        { Header: "Department", accessor: "department" },
        { Header: "Position", accessor: "position" },
        { Header: "Intime", accessor: "intime" },
        { Header: "Outtime", accessor: "outtime" },
        { Header: "lateInTime", accessor: "late_in_time" },
        { Header: "earlyOutTime", accessor: "early_out_time" },
        { Header: "EmployeeId", accessor: "employeeId" },
      ],
      datas: result,
      totalPage: Math.ceil(totalCount / size),
      totalCount,
    });
  } catch (error) {
    console.error(error);
  }
};

// တယောက်ချင်းစီရဲ့ attendance list

const getAttendanceByUserId = async (req, res) => {
  const userId = req.params.UserId;
  const { page, size, fromDate, toDate } = parseQueryParams(req);

  try {
    const totalCount = await attendanceHelper.getTotalAttendacneCountByUserId(
      userId
    );
    const attendanceListByUserId = await attendanceHelper.getAttendanceList({
      page,
      size,
      userId,
      fromDate,
      toDate,
    });

    if (!attendanceListByUserId.length > 0)
      return res.status(200).json({ message: [] });
    res.status(200).json({
      columns: [
        { Header: "Name", accessor: "username" },
        { Header: "Date", accessor: "date" },
        { Header: "Department", accessor: "departmentName" },
        { Header: "Position", accessor: "position" },
        { Header: "Intime", accessor: "intime" },
        { Header: "Outtime", accessor: "outtime" },
        { Header: "lateInTime", accessor: "late_in_time" },
        { Header: "earlyOutTime", accessor: "early_out_time" },
        { Header: "EmployeeId", accessor: "employeeId" },
      ],
      datas: attendanceListByUserId,
      totalPage: Math.ceil(totalCount / size),
      totalCount,
    });
  } catch (error) {
    console.error(error);
  }
};
module.exports = { getAttendance, getAttendanceByUserId };
