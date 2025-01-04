//
// // Code  for mongoose config in backend
// // Filename - backend/index.js
//
// // To connect with your mongoDB database
// getting-started.js
const mongoose = require('mongoose');
const validator = require( 'validator');
const { Schema } = mongoose;
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/StreamFlare');
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
    const userSchema = new Schema({
        first_name: {
            type: String,
            required: true,
        }, // String is shorthand for {type: String}
        last_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            // validate: [validator.isEmail, 'Email is invalid'],
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            // validate: {}
        },
        created_at: { type: Date, default: Date.now },
    });
}
//
// // Schema for users of app
// const UserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     date: {
//         type: Date,
//         default: Date.now,
//     },
// });
// const User = mongoose.model('users', UserSchema);
// User.createIndexes();
//
// // For backend and express
// const express = require('express');
// const app = express();
// const cors = require("cors");
// console.log("App listen at port 5000");
// app.use(express.json());
// app.use(cors());
// app.get("/", (req, resp) => {
//
//     resp.send("App is Working");
//     // You can check backend is working or not by
//     // entering http://loacalhost:5000
//
//     // If you see App is working means
//     // backend working properly
// });
//
// app.post("/register", async (req, resp) => {
//     try {
//         const user = new User(req.body);
//         let result = await user.save();
//         result = result.toObject();
//         if (result) {
//             delete result.password;
//             resp.send(req.body);
//             console.log(result);
//         } else {
//             console.log("User already register");
//         }
//
//     } catch (e) {
//         resp.send("Something Went Wrong");
//     }
// });
// app.listen(5000);
