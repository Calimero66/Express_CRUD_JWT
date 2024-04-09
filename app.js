import { equipes } from './seedData.js';
import { UserModel } from './seedData.js';
import mongoose from 'mongoose';

import dotenv from "dotenv";
dotenv.config();

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.mongoURI, {});
        console.log('MongoDB Connected!');

        // Insert equipes into the database
        await UserModel.insertMany(equipes);
        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        // Close the connection after seeding
        await mongoose.disconnect();
    }
}

// Call the seedDatabase function to start seeding
seedDatabase();
