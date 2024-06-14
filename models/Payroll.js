/**
 * @swagger
 * components:
 *   schemas:
 *     Payroll:
 *       type: object
 *       required:
 *         - attendance
 *         - payrollRate
 *         - penalty
 *         - payroll
 *         - UserId
 *       properties:
 *         attendance:
 *           type: number
 *         payrollRate:
 *           type: number
 *           format: float
 *         penalty:
 *           type: number
 *           format: float
 *         payroll:
 *           type: number
 *           format: float
 *         UserId:
 *           type: number
 */
module.exports = (sequelize, DataTypes) => {
  const Payroll = sequelize.define("Payroll", {
    attendance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    payrollRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    penalty: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    payroll: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
  });
  Payroll.associate = (models) => {
    Payroll.belongsTo(models.Users, { foreignKey: "UserId" });
  };
  return Payroll;
};
