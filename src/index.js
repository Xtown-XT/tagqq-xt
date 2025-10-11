import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {responseHelper } from './middleware/index.js';
import endUserRoutes from './endUser/routes/index.js';
import useragentRoutes from './user_agent/routes/index.js'
import adminuserRoutes from './admin_user/routes/index.js'
import thridPartyAPIRoutes from './thridPartyAPI/routes/index.js';
import apiLimiter from './middleware/ratelimite.js'
import bloodGroupRoutes from './bloodgroup/routes/index.js'
import captainRoutes from './captain_user/routes/index.js'
import captainTransaxtionRoutes from './captain_user/routes/index.js';


const app = express();

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // adjust for frontend scripts
//       styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles if needed
//       imgSrc: ["'self'", "data:", "blob:"],
//       connectSrc: ["'self'", "*"], // adjust if you have APIs from other origins
//       fontSrc: ["'self'", "data:"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );


app.use(responseHelper);
app.use('/api/', apiLimiter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
}
);

app.get('/api/data', (req, res) => {
  res.sendSuccess({ value: 42 }, 'Data fetched successfully');
});

app.get('/api/error', (req, res) => {
  res.sendError('Something went wrong', 422, [{ field: 'email', message: 'Invalid' }]);
});


app.use('/api/v1/onscan', endUserRoutes);
app.use('/api/v1/onscan', useragentRoutes);
app.use('/api/v1/onscan', adminuserRoutes);
app.use('/api/v1/onscan', bloodGroupRoutes);
app.use('/api/v1/onscan', captainRoutes);
app.use('/api/v1/onscan', captainTransaxtionRoutes);



app.use('/api/v1/onscan', thridPartyAPIRoutes);




app.use((req, res) => {
  return res.sendError('Route not found', 404);       
});


export default app;    



