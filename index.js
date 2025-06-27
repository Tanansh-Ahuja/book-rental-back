const express = require("express");
const cors = require("cors");
const morgan = require('morgan');
require("dotenv").config();

const app = express();
app.use(morgan('dev')); 
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const bookRoutes = require("./routes/books");
const authRoutes = require("./routes/auth");

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
