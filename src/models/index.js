import { User, UserSchema } from "./userModel.js";

const setupModels = (sequelize) => {    
    User.init(UserSchema, User.config(sequelize));
}
export default setupModels;
