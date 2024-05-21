const { Attendance_Record, Attendance } = require("../models");
const UserHelper = require("../helpers/DBHelper");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId, adminApproved } = req.body;
  if (!reason || !date || !UserId)
    return res.status(404).send("Credential Missing!");
  const attendaceRequest = {
    reason: reason || "in_time_late", // "out_time_late"
    date: date || "2024-5-13",
    UserId: UserId || 3,
    adminApproved: adminApproved || false,
  };
  if (await UserHelper.checkUserInAttendanceDB(UserId)) {
    // API မှ adminApproved ကို ture လို့ထားပြီး request လုပ်လာပါက...
    if (attendaceRequest.adminApproved) {
      if (await UserHelper.checkUserAlreadyApproved(UserId, date)) {
        if (await UserHelper.findUserAttendanceLeaveCount(UserId)) {
          const result = await UserHelper.findAndReplace(UserId, reason, date);
          if (result) {
            // attendance request table တွင် approved ပြင်ရန်
            await UserHelper.updateUserStatusInDB(UserId, date);
            res
              .status(200)
              .json({ message: "Operation Successful", success: true });
          } else {
            res.status(200).send({
              message:
                "Already Update your data, you don't need to do second time",
              success: false,
            });
          }
        } else {
          res.status(401).json({
            message: "You don't have any leave count",
            success: false,
          });
        }
      } else {
        res.status(400).json({
          message: "adminApproved :Admin မှ Approved လုပ်ပေးပြီးသားမို့လို့ပါ",
          success: false,
        });
      }
    } else {
      console.log("I am in Admin Permission false case");
      // API မှ adminApproved ကို false လို့ထားပြီး request လုပ်လာပါက...
      await UserHelper.setUserAttendanceToRejected(UserId, date);

      res.status(401).json({
        message: "Admin မှ Permission False...",
        success: false,
      });
    }
  }
};

// get all attendance request
const getAttendanceRequest = async (req, res) => {
  const listOfRequest = await Attendance_Record.findAll();
  if (!listOfRequest) res.status(404).json("Attendance request list not found");
  res.status(200).json(listOfRequest);
};

// update status
const updatedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const attendanceRequest = await Attendance_Record.findByPk(id);
  if (!attendanceRequest) res.status(404).json("Attendance request not found");
  attendanceRequest.status = status;
  await attendanceRequest.save();
  res.status(200).json(attendanceRequest);
};
module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
};
