module.exports = (sequelize, DataType) => {
  const Department = sequelize.define("Department", {
    deptName: {
      type: DataType.STRING,
      allowNull: false,
    },
    totalCount: {
      type: DataType.INTEGER,
      allowNull: true,
    },
  });

  Department.associate = (models) => {
    Department.hasOne(models.Users);
  };
  return Department;
};
