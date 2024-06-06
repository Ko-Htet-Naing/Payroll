module.exports = (sequelize, DataTypes) => {
  return sequelize.define("location", {
    lat: {
      type: DataTypes.DECIMAL(17, 14),
      allowNull: false,
    },
    lon: {
      type: DataTypes.DECIMAL(17, 15),
      allowNull: false,
    },
    range: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
