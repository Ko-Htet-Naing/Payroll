module.exports = (sequelize, DataType) => {
  const token = sequelize.define("Fcm_Tokens", {
    token: {
      type: DataType.STRING,
      allowNull: true,
    },
  });

  token.associate = (models) => {
    token.belongsTo(models.Users, { foreignKey: "UserId" });
  };

  return token;
};
