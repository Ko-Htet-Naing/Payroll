module.exports = (sequelize, DataTypes) => {
  const Holidays = sequelize.define("Holidays", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
  });
  return Holidays;
};
