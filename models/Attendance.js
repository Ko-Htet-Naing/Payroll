/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - dateTime
 *         - UserId
 *       properties:
 *         dateTime:
 *           type: string
 *           description: check in with data and time
 *         UserId:
 *           type: integer
 *           description: userid as a foreign key
 *       example:
 *         dateTime: 2024-05-15
 *         UserId: 1
 */
module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    in_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    out_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    late_in_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    early_out_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Users, { foreignKey: "UserId" });
  };
  return Attendance;
};
