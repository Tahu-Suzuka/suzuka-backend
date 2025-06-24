import { Router } from "express";
import userRoutes from "./userRoute.js";
import productRoutes from "./productRoute.js";
import categoryRoutes from "./categoryRoute.js";
import adminRoutes from "./adminRoute.js";
import orderRoutes from "./orderRoute.js";
import cartRoutes from "./cartRoute.js";
import voucherRoutes from "./voucherRoute.js";
import reportRoutes from "./reportRoute.js";
import reviewRoutes from "./reviewRoute.js";

function routerApi(app) {
    const router = Router();
    app.use("/", router);
    router.use("/users", userRoutes);
    router.use("/products", productRoutes);
    router.use("/categories", categoryRoutes);
    router.use("/admin", adminRoutes);
    router.use("/orders", orderRoutes); 
    router.use("/carts", cartRoutes);
    router.use("/vouchers", voucherRoutes);
    router.use("/reports", reportRoutes);
    router.use("/reviews", reviewRoutes); 
}

export default routerApi;