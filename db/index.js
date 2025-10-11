import { sequelize } from "../src/db/index.js";
// import apikey from '../src/thridPartyAPI/models/apiKeys.models.js'
// import calllog from '../src/thridPartyAPI/models/callLogs.js'
import points from '../src/admin_user/models/points.models.js'
import * as endUserModels from "../src/endUser/models/index.js";
import * as userAgentModels from "../src/user_agent/models/index.js";
import * as thirdPartyAPIModels from "../src/thridPartyAPI/models/index.js";
import * as Captainuser from "../src/captain_user/models/captain_config.models.js"

// import * as Captainuser from "../src/captain_user/models/captainTransactionModel.js"


// import Orders from "../src/user_agent/models/orders.model.js";




// const user_agent = thirdPartyAPIModels.Apikey

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");
  } catch (err) {
    console.error("Error syncing database:", err.message);
    throw err
  }
}

syncDatabase().then((data) => console.log("synced")).catch((err)=> console.err("error"));