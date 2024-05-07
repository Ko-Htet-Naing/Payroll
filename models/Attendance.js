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
    late_in: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    early_out: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });

  return Attendance;
};
