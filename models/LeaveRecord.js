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
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return LeaveRecord;
};
