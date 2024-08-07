/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - Email
 *         - Gender
 *         - Position
 *         - EmployeeId
 *         - Payroll
 *         - ProfileImage
 *         - DOB
 *         - PhoneNumber
 *         - Address
 *         - AnnualLeave
 *         - MedicalLeave
 *         - AttendanceLeave
 *         - NRC
 *         - DepartmentId
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         Email:
 *           type: string
 *         Gender:
 *           type: string
 *         Position:
 *           type: string
 *         EmployeeId:
 *           type: string
 *         Payroll:
 *           type: number
 *         ProfileImage:
 *           type: string
 *         DOB:
 *           type: string
 *         PhoneNumber:
 *           type: number
 *         Address:
 *           type: string
 *         AnnualLeave:
 *           type: number
 *         MedicalLeave:
 *           type: number
 *           format: float
 *         AttendanceLeave:
 *           type: number
 *         NRC:
 *           type: string
 *         DepartmentId:
 *           type: integer
 */
module.exports = (sequelize, DataType) => {
  const Users = sequelize.define("Users", {
    username: {
      type: DataType.STRING,
      allowNull: false,
    },
    password: {
      type: DataType.STRING,
      allowNull: false,
    },
    Email: {
      type: DataType.STRING,
      allowNull: false,
      unique: true,
    },
    Gender: {
      type: DataType.STRING,
      allowNull: false,
    },
    Role: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    Position: {
      type: DataType.STRING,
      allowNull: false,
    },
    CurrentAccessToken: {
      type: DataType.STRING,
      allowNull: true,
    },
    EmployeeId: {
      type: DataType.STRING,
      allowNull: false,
      unique: true,
    },
    Salary: {
      type: DataType.INTEGER,
      allowNull: true,
    },
    ProfileImage: {
      type: DataType.STRING,
      allowNull: false,
    },
    DOB: {
      type: DataType.STRING,
      allowNull: false,
    },
    PhoneNumber: {
      type: DataType.STRING,
      allowNull: false,
      unique: true,
    },
    Address: {
      type: DataType.STRING,
      allowNull: false,
    },
    AnnualLeave: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    MedicalLeave: {
      type: DataType.FLOAT,
      allowNull: false,
    },
    AttendanceLeave: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    NRC: {
      type: DataType.STRING,
      allowNull: false,
      unique: true,
    },
    refreshToken: {
      type: DataType.STRING,
      allowNull: true,
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Attendance, { foreignKey: "UserId" });
    Users.hasMany(models.LeaveRecord, { foreignKey: "UserId" });
    Users.belongsTo(models.Department, { foreignKey: "DepartmentId" });
    Users.hasMany(models.Attendance_Record, { foreignKey: "UserId" });
    Users.hasOne(models.Fcm_Tokens, { foreignKey: "UserId" });
    Users.hasMany(models.Payroll, { foreignKey: "UserId" });
    Users.hasMany(models.Pending_Notification, { foreignKey: "UserId" });
  };

  return Users;
};
