require("dotenv").config()
const request = require("request")
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(__dirname))
app.set("view engine", "ejs")

//Connecting a mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })

// Creating a Schema

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
})

// Encryption
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] })

// Creating a model
const User = new mongoose.model("User", userSchema)

app.get("/", function (request, response) {
	response.render("home")
})
app.get("/register", function (request, response) {
	response.render("register")
})
app.post("/register", function (request, response) {
	const newUser = new User({
		email: request.body.username,
		password: request.body.password,
	})
	newUser.save(function (err) {
		if (err) {
			console.log(err)
		} else {
			response.render("secrets")
		}
	})
})
app.get("/login", function (request, response) {
	response.render("login")
})
app.post("/login", function (request, response) {
	const username = request.body.username
	const password = request.body.password

	User.findOne({ email: username }, function (err, foundUser) {
		if (err) {
			console.log(err)
		} else {
			if (foundUser.password === password) {
				response.render("secrets")
			} else {
				console.log(err)
			}
		}
	})
})

app.listen(3000, function () {
	console.log("Server started on port 3000")
})
