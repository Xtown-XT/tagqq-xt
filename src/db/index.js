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
     