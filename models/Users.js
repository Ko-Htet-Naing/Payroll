module.exports = (sequelize, DataType) => {
  const Users = sequelize.define("Users", {
    username: {
      type: DataType.STRING,
      allowNull: false,
    },
    password: {
      type: DataType.STRING,
      allowNull: false,
    },
    Email: {
      type: DataType.STRING,
      allowNull: false,
    },
    Gender: {
      type: DataType.STRING,
      allowNull: false,
    },
    Role: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    Position: {
      type: DataType.STRING,
      allowNull: false,
    },
    EmployeeId: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    Payroll: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    ProfileImage: {
      type: DataType.STRING,
      allowNull: false,
    },
    DOB: {
      type: DataType.STRING,
      allowNull: false,
    },
    PhoneNumber: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    Address: {
      type: DataType.STRING,
      allowNull: false,
    },
    AnnualLeave: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    MedicalLeave: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    NRC: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Attendance);
    Users.hasMany(models.LeaveRecord);
  };

  return Users;
};
