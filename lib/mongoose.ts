import mongoose from 'mongoose';

let isConnected = false;

export const connectToDb = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URL)  return console.log("|| MONGO URL not found ||");
    if(isConnected) return console.log("|| Already connected to MongoDB ||");

    try {
        await mongoose.connect(process.env.MONGODB_URL as string);
        isConnected = true;
        console.log("|| Connected to MongoDB ||");

    } catch (error) {
        console.log("Error connecting to MongoDB :- ", error);
    }

};