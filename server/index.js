const express = require('express');
const app = express();
const PORT = 3890;
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/user');

// Setup env vars
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Successfully connected to db"))
  .catch((err) => console.log("Error connecting to db: ", err.message));

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// API Endpoints
app.post("/users/:pwd/create/", async (req, res) => {
  const password = req.params.pwd;
  const user = req.body;

  if (!user || !user.name || !user.email ) {
    return res.status(400).send({ error: "No user provided or incomplete data" });
  }
  if (!password) {
    return res.status(400).send({ error: "No password provided :(" });
  }
  if (password !== "123456") {
    return res.status(401).send({ error: "Wrong password :(" });
  }

  const newUser = new User({
    name: user.name,
    email: user.email,
  });

  try {
    const savedUser = await newUser.save();
    return res.status(201).send(savedUser);
  } catch (error) {
    return res.status(500).send({ error: "Error saving user", details: error });
  }
});

app.post("/users/:pwd/update/:id/", async (req, res) => {
  const password = req.params.pwd;
  const id = req.params.id;
  const user = req.body;

  if (!user || !user.name || !user.email || !id) {
    return res.status(400).send({ error: "No user provided or incomplete data" });
  }
  if (!password) {
    return res.status(400).send({ error: "No password provided :(" });
  }
  if (password !== "123456") {
    return res.status(401).send({ error: "Wrong password :(" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: "Invalid user ID" });
  }

  const updateData = {
    name: user.name,
    email: user.email,
  };

  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      updateData,  
      { new: true, runValidators: true },
    ); 

    if (!updateUser) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send(updateUser);
  } catch (error) {
    return res.status(500).send({ error: "Error updating user", details: error });
  }
});

app.get("/users/:pwd/getall/", async (req, res) => {
  const password = req.params.pwd; // You missed this line

  if (!password) {
    return res.status(400).send({ error: "No password provided :(" });
  }
  if (password !== "123456") {
    return res.status(401).send({ error: "Wrong password :(" });
  }

  try {
    const users = await User.find();
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: "Error retrieving users", details: error });
  }
});

