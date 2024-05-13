module.exports = (sequelize, DataTypes) => {
  const Attendance_Record = sequelize.define("Attendance_Record", {
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });
  Attendance_Record.associate = (models) => {
    Attendance_Record.belongsTo(models.Users, { foreignKey: "UserId" });
  };
  return Attendance_Record;
};
