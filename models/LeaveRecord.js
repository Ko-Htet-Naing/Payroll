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
