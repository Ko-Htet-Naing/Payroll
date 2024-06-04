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
