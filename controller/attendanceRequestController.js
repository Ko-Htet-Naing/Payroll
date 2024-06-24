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
    reason: reason,
    date: date,
    UserId: UserId,
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
  const { date, reason, UserId } = userData;
  if (!adminApproved) {
    // User request အား Reject လုပ်တဲ့ case
    // Leave Count ကို စစ်နိုင်တဲ့ function

    // Reject လုပ်ပြီးသားလား မလုပ်ရသေးဘူး လား စစ်ဆေးပေးတဲ့ function
    const rejectedResult = await UserHelper.checkUserAlreadyApproved(
      id,
      "Rejected"
    );
    if (!rejectedResult.isSuccess)
      return res.status(401).json({
        message: rejectedResult.message,
        isSuccess: rejectedResult.isSuccess,
      });
    await Users.increment("AttendanceLeave", {
      by: 1,
      where: { id: UserId },
    });
    console.log(
      "Token checking in rejected noti: ",
      await isValidToken(UserId)
    );
    if (!(await isValidToken(UserId))) {
      await UserHelper.updateUserStatusInDB(UserId, date, "Rejected");
      await UserHelper.sendPendingMessageInDB(
        UserId,
        `Dear ${await UserHelper.getUsernameFromDB(UserId)} Rejected Case Noti`,
        "We would like to inform you that your request has been rejected by the admin."
      );
      return res.status(200).json({ message: rejectedResult?.message });
    }
    // Noti မပေးခင် state ပြင်ပေး pending to rejected
    await UserHelper.updateUserStatusInDB(UserId, date, "Rejected");
    // Reject notification
    await SendNoti(
      `Rejected Case Noti`,
      "  We would like to inform you that your request has been rejected by the admin.",
      UserId
    );
    res.status(200).json({ message: rejectedResult?.message });
  } else {
    // User Request အား Approve လုပ်တဲ့ Case
    // User ကို approved လုပ်ပြီးသား ဟုတ်မဟုတ် စစ်ဆေးပေးတဲ့ function
    const alreadyApprovedResult = await UserHelper.checkUserAlreadyApproved(
      id,
      "Approved"
    );
    if (!alreadyApprovedResult?.isSuccess)
      return res.status(404).json({
        message: alreadyApprovedResult?.message,
        isSuccess: alreadyApprovedResult?.isSuccess,
      });
    // Request Database အတွင်း Approved ပြင်ခြင်း
    const approvedResult = await UserHelper.confirmRequest(id, "Approved");
    if (approvedResult) {
      //  Attendance Database ထဲမှာ time ပြုပြင်ခြင်း
      const result = await UserHelper.findAndReplace(UserId, reason, date);
      if (result.success) {
        res
          .status(200)
          .json({ message: result.message, success: result.success });
        // အောင်မြင်ကြောင်း notification
        console.log(
          "Token checking in successful noti: ",
          await isValidToken(UserId)
        );
        if (!(await isValidToken(UserId))) {
          // Noti for token invalid user
          const result = await UserHelper.sendPendingMessageInDB(
            UserId,
            `Dear ${await UserHelper.getUsernameFromDB(
              UserId
            )} Approved Case Noti`,
            "We would like to inform you that your request has been approved by the admin."
          );
          if (result > 0)
            return res
              .status(200)
              .json({ message: "Approved operation success" });
        }
        // Notif for token valid user
        await SendNoti(
          `Dear ${await UserHelper.getUsernameFromDB(
            UserId
          )} Approved Case Noti`,
          "  We would like to inform you that your request has been accepted by the admin.",
          UserId
        );
      } else if (result.success === false) {
        res.status(200).send({
          message: result.message,
          success: result.success,
        });
      }
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
    ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
    ...(position && { Position: { [Op.like]: `%${position}%` } }),
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

// get attendance request by id
const getAttendanceRequestById = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);
  const { id } = req.params;
  if (!id) return res.status(404).send("Id is missing");
  const totalCount = await Attendance_Record.count({ where: { UserId: id } });

  const result = await Attendance_Record.findAll({
    where: {
      UserId: id,
    },
    raw: true,
    limit: size,
    offset: page * size,
  });
  console.log(result);
  console.log(result.length);
  return result.length > 0
    ? res
        .status(200)
        .json({
          message: result,
          totalCount: totalCount,
          totalPage: Math.ceil(totalCount / size),
        })
    : res.status(404).json({ message: "You have no attendance request yet." });
};

// update status
const updatedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // const attendanceRequest = await Attendance_Record.findByPk(id);
  // if (!attendanceRequest) res.status(404).json("Attendance request not found");
  // attendanceRequest.status = status;
};

// get attendance request by id
const getAttendanceRequestById = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);
  const { id } = req.params;
  if (!id) return res.status(404).send("Id is missing");
  const totalCount = await Attendance_Record.count({ where: { UserId: id } });
  const result = await Attendance_Record.findAll({
    where: {
      UserId: id,
    },
    raw: true,
    imit: size,
    offset: page * size,
  });
  console.log(result);
  console.log(result.length);
  return result.length > 0
    ? res.status(200).json({
        message: result,
        totalCount: totalCount,
        totalPage: Math.ceil(totalCount / size),
      })
    : res.status(404).json({ message: "You have no attendance request yet." });
};

module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
  confirmRequest,
  getAttendanceRequestById,
};
