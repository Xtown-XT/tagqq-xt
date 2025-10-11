// src/app/captain_profile/models/captain_profile.models.js
import { sequelize } from "../../db/index.js";
import { DataTypes } from "sequelize";

const CaptainProfile = sequelize.define(
  "captain_profile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    captain_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    personal_details: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    bank_details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },
  },
  {
    tableName: "captain_profile",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default CaptainProfile;
