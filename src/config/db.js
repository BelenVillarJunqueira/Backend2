const mongoose = require('mongoose');
const { MONGO_URL } = require('./envs');

const connectDB = async () => {
    try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado correctamente a MongoDB");}
    catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1); 
}
};

module.exports = connectDB;
