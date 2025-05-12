import { Router } from "express";
import userRoutes from "./userRoute.js";
import productRoutes from "./productRoute.js";
import categoryRoutes from "./categoryRoute.js";

function routerApi(app) {
    const router = Router();
    app.use("/", router);
    router.use("/users", userRoutes);
    router.use("/products", productRoutes);
    router.use("/categories", categoryRoutes);
}

export default routerApi;