/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - in_time
 *         - out_time
 *         - late_in_time
 *         - early_out_time
 *         - date
 *       properties:
 *         in_time:
 *           type: string
 *           format: time
 *         out_time:
 *           type: string
 *           format: time
 *         late_in_time:
 *           type: number
 *         early_out_time:
 *           type: number
 *         date:
 *           type: string
 *           format: date
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
