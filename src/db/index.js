// import { Sequelize  } from "sequelize"; 

// const sequelize = new Sequelize("mysql://ramya:Ramya123r@192.168.1.23/onscan") 

// const sequelize = new Sequelize("mysql://vishnu:vishnu123cj@150.242.201.153/onscan") 


import { Sequelize } from "sequelize";

const sequelize = new Sequelize("tagqq", "ramya", "ramya", {
  host: "192.168.1.150",
  port: 3306,
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Database is Connected"))
  .catch((err) => console.error(`Database connection error: ${err}`));

export { sequelize };
     

// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize(
//   process.env.DB_NAME || "tagqq",
//   process.env.DB_USER || "ramya",
//   process.env.DB_PASSWORD || "ramya",
//   {
//     host: process.env.DB_HOST || "192.168.1.150",
//     port: process.env.DB_PORT || 3306,
//     dialect: "mysql",
//     dialectOptions: {
//       connectTimeout: 60000, // 60 seconds
//       ssl: process.env.DB_SSL === 'true' ? {
//         rejectUnauthorized: false
//       } : undefined
//     },
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 60000,
//       idle: 10000
//     },
//     logging: process.env.NODE_ENV === 'development' ? console.log : false
//   }
// );

// sequelize
//   .authenticate()
//   .then(() => console.log("✅ Database is Connected"))
//   .catch((err) => console.error(`❌ Database connection error: ${err}`));

// export { sequelize };