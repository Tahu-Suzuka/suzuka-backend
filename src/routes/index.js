import { Router } from "express";
import userRoutes from "./userRoute.js";

function routerApi(app) {
    const router = Router();
    app.use("/", router);
    router.use("/users", userRoutes);
}

export default routerApi;