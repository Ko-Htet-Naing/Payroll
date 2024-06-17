/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - deptName
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the book
 *         deptName:
 *           type: string
 *           description: The department name
 *
 *       example:
 *         deptName: Software
 */
module.exports = (sequelize, DataType) => {
  const Department = sequelize.define("Department", {
    deptName: {
      type: DataType.STRING,
      allowNull: false,
      unique: true,
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
