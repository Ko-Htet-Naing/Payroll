module.exports = (sequelize, DataType) => {
  const token = sequelize.define("Fcm_Tokens", {
    token: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  token.associate = (models) => {
    token.belongsTo(models.Users, { foreignKey: "UserId" });
  };

  return token;
};
