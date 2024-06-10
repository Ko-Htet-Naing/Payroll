const { Attendance_Record, Department, Users } = require("../models");
const { Op } = require("sequelize");
const UserHelper = require("../helpers/DBHelper");
const { SendNoti } = require("../helpers/SendNoti");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId } = req.body;
  if (!reason || !date || !UserId)
    return res.status(404).send("Credential Missing!");
  const attendaceRequest = {
    reason: reason || "in_time_late", // "out_time_late"
    date: date || "2024-5-13",
    UserId: UserId || 3,
  };
  // DB တွင် pending state သုံးပြီး record တကြောင်းတိုးပေးရန်
  const result = await UserHelper.createNewAttendanceRequest(attendaceRequest);
  result
    ? res.status(200).send("Successfully Requested To HR")
    : res.status(400).send("Already Requested To HR");
};

// Admin မှ Confirmed(true or false) လုပ်ထားသော request များ
const confirmRequest = async (req, res) => {
  const { reason, date, UserId, adminApproved } = req.body;
  if (!reason || !date || !UserId)
    return res.status(404).send("Credential Missing");
  const attendaceRequest = {
    reason: reason || "in_time_late", // "out_time_late"
    date: date || "2024-5-13",
    UserId: UserId || 3,
    adminApproved: adminApproved || false,
  };
  if (await UserHelper.checkUserInAttendanceDB(UserId)) {
    // API မှ adminApproved ကို ture လို့ထားပြီး request လုပ်လာပါက...
    if (!attendaceRequest.adminApproved) {
      const isTokenExists = await SendNoti(
        "Reject Case Noti",
        "We regret to inform you that your request has been denied by the admin due to various reasons.",
        UserId
      );
      if (!isTokenExists) {
        return res
          .status(404)
          .send(
            "မင်းမှာ count ရှိသေးပေမဲ့ admin မှ အကြောင်းကြောင်းကြောင့် ပယ်ချလိုက်ပါတယ်."
          );
      } else {
      }
    }

    if (!(await UserHelper.checkUserAlreadyApproved(UserId, date)))
      return res.status(404).json({
        message: "adminApproved :Admin မှ Approved လုပ်ပေးပြီးသားမို့လို့ပါ",
        success: false,
      });

    if (!(await UserHelper.findUserAttendanceLeaveCount(UserId)))
      return res.status(401).json({
        message: "You don't have any leave count",
        success: false,
      });

    // User ရဲ့ AM PM ပေါ်မူတည်ပြီး time ကို ပြုပြင်ခြင်း
    const result = await UserHelper.findAndReplace(UserId, reason, date);
    if (result.success) {
      // attendance request table တွင် ရလဒ်ပေါ်မူတည်ပြီး Approved Rejected ပြင်ရန်
      await UserHelper.updateUserStatusInDB(UserId, date);
      // အောင်မြင်ကြောင်း notification
      await SendNoti(
        "Approved Case Noti",
        "  We would like to inform you that your request has been accepted by the admin.",
        UserId
      );
      res
        .status(200)
        .json({ message: result.message, success: result.success });
    } else if (result.success === false) {
      res.status(200).send({
        message: result.message,
        success: result.success,
      });
    }
  }
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
