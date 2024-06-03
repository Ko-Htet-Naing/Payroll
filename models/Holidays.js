module.exports = (sequelize, DataTypes) => {
  const Holidays = sequelize.define("Holidays", {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
  });
  return Holidays;
};
