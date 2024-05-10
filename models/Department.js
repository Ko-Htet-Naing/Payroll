module.exports = (sequelize, DataType) => {
  const Department = sequelize.define("Department", {
    deptName: {
      type: DataType.STRING,
      allowNull: false,
    },
    totalCount: {
      type: DataType.INTEGER,
      defaultValue: 0,
    },
  });

  Department.associate = (models) => {
    Department.hasMany(models.Users, { foreignKey: "DepartmentId" });
  };
  return Department;
};
