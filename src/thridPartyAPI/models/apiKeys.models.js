import { sequelize } from '../../db/index.js';
import { DataTypes } from 'sequelize';




const ApiKey = sequelize.define('api_keys', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.ENUM,
        values: ["quickekyc","whatapp","smtp", "twillo", "razorpay", "stripe", "ai_agent", "metawhatapp", "phonepe", "vodafone"],
        allowNull: false,
        unique: true,
    },
    keys: {
        type: DataTypes.JSON,
        allowNull: false
    },
   
}, {
    tableName: 'api_keys',
    indexes: [{
        unique: true,
        fields: ["id"]
    },
    {
        unique: true,
        fields: ["name"]
    }
]
})

export default ApiKey 