"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Role: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Position: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      EmployeeId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      Payroll: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ProfileImage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      DOB: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      PhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      AnnualLeave: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      MedicalLeave: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      AttendanceLeave: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      NRC: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      DepartmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
