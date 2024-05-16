/**
 * @swagger
 * components:
 *   schemas:
 *     LeaveRecord:
 *       type: object
 *       required:
 *         - reasons
 *         - leaveType
 *         - status
 *         - from
 *         - to
 *         - attachmentUrl
 *         - UserId
 *       properties:
 *         reasons:
 *           type: string
 *         leaveType:
 *           type: string
 *         status:
 *           type: string
 *         from:
 *           type: string
 *           format: date
 *         to:
 *           type: string
 *           format: date
 *         attachmentUrl:
 *           type: string
 *         UserId:
 *           type: integer
 *       example:
 *         reasons: illness
 *         leaveType: Medical Leave
 *         status: Pending
 *         from: 2024-05-14
 *         to : 2024-05-14
 *         UserId: 1
 */
module.exports = (sequelize, DataTypes) => {
  const LeaveRecord = sequelize.define("LeaveRecord", {
    reasons: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leaveType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending",
    },
    from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  LeaveRecord.associate = (models) => {
    LeaveRecord.belongsTo(models.Users, { foreignKey: "UserId" });
  };
  return LeaveRecord;
};
