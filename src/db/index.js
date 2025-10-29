// import { Sequelize  } from "sequelize"; 

// const sequelize = new Sequelize("mysql://ramya:Ramya123r@192.168.1.23/onscan") 

// const sequelize = new Sequelize("mysql://vishnu:vishnu123cj@150.242.201.153/onscan") 


import { Sequelize } from "sequelize";

// Try using the connection URI first (recommended for Clever Cloud)
let sequelize;
if (process.env.MYSQL_ADDON_URI) {
  console.log("🔗 Using MYSQL_ADDON_URI for connection");
  sequelize = new Sequelize(process.env.MYSQL_ADDON_URI, {
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });
} else {
  console.log("🔧 Using individual environment variables for connection");
  sequelize = new Sequelize(
    process.env.MYSQL_ADDON_DB || process.env.DB_NAME || "tagqq",
    process.env.MYSQL_ADDON_USER || process.env.DB_USER || "ramya",
    process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD || "ramya",
    {
      host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || "192.168.1.150",
      port: process.env.MYSQL_ADDON_PORT || process.env.DB_PORT || 3306,
      dialect: "mysql",
      dialectOptions: {
        connectTimeout: 60000,
        ssl: {
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
  );
}

sequelize
  .authenticate()
  .then(() => console.log("✅ Database is Connected"))
  .catch((err) => console.error(`❌ Database connection error: ${err}`));

export { sequelize };