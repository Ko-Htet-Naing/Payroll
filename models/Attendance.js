module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    in_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    out_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });
  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Users, { foreignKey: "UserId" });
  };
  return Attendance;
};
