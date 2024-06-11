const { Attendance_Record, Department, Users } = require("../models");
const { Op } = require("sequelize");
const UserHelper = require("../helpers/DBHelper");
const { SendNoti, isValidToken } = require("../helpers/SendNoti");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId } = req.body;
  if (!reason || !date || !UserId)
    return res.status(404).json({ message: "Credential Missing!" });
  const attendaceRequest = {
    reason: reason || "in_time_late", // "out_time_late"
    date: date || "2024-5-13",
    UserId: UserId || 3,
  };
  // DB တွင် pending state သုံးပြီး record တကြောင်းတိုးပေးရန်
  const result = await UserHelper.createNewAttendanceRequest(attendaceRequest);
  result?.isSuccess
    ? res.status(200).json({ message: result.message })
    : res.status(400).json({ message: result.message });
};

// Admin မှ Confirmed(true or false) လုပ်ထားသော request များ
const confirmRequest = async (req, res) => {
  const { id, adminApproved } = req.body;
  if (!id || adminApproved === undefined || adminApproved === null)
    return res.status(404).json({ message: "UserId or adminApproved Missing" });
  const userData = await UserHelper.getUserData(id);
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  const { date, reason } = userData;
  if (!adminApproved) {
    // User request အား Reject လုပ်တဲ့ case
  } else {
    // User Request အား Approve လုပ်တဲ့ Case
    const approvedResult = await UserHelper.checkUserAlreadyApproved(id);
    if (!approvedResult.isSuccess) {
      const statusCode = approvedResult.isSuccess ? 200 : 400;
      return res.status(statusCode).json({
        isSuccess: approvedResult.isSuccess,
        message: approvedResult.message,
      });
    }

    const result = await UserHelper.rejectUserRequest(id);
    console.log(result);
  }

  // if (!(await UserHelper.findUserAttendanceLeaveCount(UserId)))
  //   return res.status(401).json({
  //     message: "You don't have any leave count",
  //     success: false,
  //   });

  // User ရဲ့ AM PM ပေါ်မူတည်ပြီး time ကို ပြုပြင်ခြင်း
  // const result = await UserHelper.findAndReplace(UserId, reason, date);
  // if (result.success) {
  //   // attendance request table တွင် ရလဒ်ပေါ်မူတည်ပြီး Approved Rejected ပြင်ရန်
  //   await UserHelper.updateUserStatusInDB(UserId, date);
  //   // အောင်မြင်ကြောင်း notification
  //   await SendNoti(
  //     "Approved Case Noti",
  //     "  We would like to inform you that your request has been accepted by the admin.",
  //     UserId
  //   );
  //   res.status(200).json({ message: result.message, success: result.success });
  // } else if (result.success === false) {
  //   res.status(200).send({
  //     message: result.message,
  //     success: result.success,
  //   });
  // }
};

// get all attendance request
const getAttendanceRequest = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);
  const {
    username,
    from,
    to,
    position,
    department,
    reason,
    status,
    employeeId,
  } = req.query;

  const totalCount = await Attendance_Record.count();
  const totalPage = Math.ceil(totalCount / size);

  const whereClause = {
    ...(from && to && { date: { [Op.between]: [from, to] } }),
    ...(status && { status: status }),
    ...(reason && { reason: reason }),
  };

  const whereUser = {
    ...(username && { username: { [Op.like]: `%${username}%` } }),
    ...(employeeId && { EmployeeId: employeeId }),
    ...(position && { Position: position }),
  };
  const userInclude = {
    where: whereUser,
    model: Users,
    attributes: ["username", "EmployeeId", "Position"],
    include: [
      {
        model: Department,
        attributes: ["deptName"],
        ...(department && { where: { deptName: department } }),
      },
    ],
  };

  const order = [["id", "DESC"]];
  const listOfRequest = await Attendance_Record.findAll({
    where: whereClause,
    include: [userInclude],
    order: order,
    offset: page * size,
    limit: size,
  });
  if (!listOfRequest) res.status(404).json("Attendance request list not found");
  res.status(200).json({
    columns: [
      { Header: "Name", accessor: "username" },
      { Header: "EmployeeId", accessor: "employeeId" },
      { Header: "Date", accessor: "date" },
      { Header: "Position", accessor: "position" },
      { Header: "Department", accessor: "deptName" },
      { Header: "Reason", accessor: "reason" },
      { Header: "Status", accessor: "status" },
    ],
    datas: listOfRequest,
    totalPages: totalPage,
    totalCount: totalCount,
  });
};

// update status
const updatedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // const attendanceRequest = await Attendance_Record.findByPk(id);
  // if (!attendanceRequest) res.status(404).json("Attendance request not found");
  // attendanceRequest.status = status;
};

module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
  confirmRequest,
};
