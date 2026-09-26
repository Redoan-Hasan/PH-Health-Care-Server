import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from "cookie-parser";
import { PaymentController } from './app/modules/payment/payment.controller';
import cron from 'node-cron';
import { AppointmentServices } from './app/modules/appointment/appointment.services';
import ApiError from './errorHelpers/ApiError';

const app: Application = express();

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.webhook
);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


cron.schedule('* * * * *', () => {
  try {
    console.log("Running cron job to cancel unpaid appointments");
    AppointmentServices.cancelUnpaidAppointments();
  } catch (error) {
    console.log("Error in cron job:", error);
  }
});

app.use('/api/v1/', router);
app.get('/', (req: Request, res: Response) => {
    const uptimeInSeconds = process.uptime();
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        timeStamp: new Date().toISOString()
    });
});


app.use(globalErrorHandler);

app.use(notFound);

export default app;