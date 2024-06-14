module.exports = (sequelize, DataTypes) => {
  const Pending_Notification = sequelize.define("Pending_Notification", {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Pending_Notification.associate = (models) => {
    Pending_Notification.belongsTo(models.Users, { foreignKey: "UserId" });
  };

  return Pending_Notification;
};
