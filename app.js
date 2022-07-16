require("dotenv").config()
const request = require("request")
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(__dirname))
app.set("view engine", "ejs")

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
)
app.use(passport.initialize())
app.use(passport.session())
//Connecting a mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })
// mongoose.set("useCreateIndex", true);

// Creating a Schema
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
})

userSchema.plugin(passportLocalMongoose)
// Creating a model
const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", function (request, response) {
	response.render("home")
})

app.get("/register", function (request, response) {
	response.render("register")
})
app.post("/register", function (request, response) {
	User.register(
		{ username: request.body.username },
		request.body.password,
		function (err, user) {
			if (err) {
				console.log(err)
				response.redirect("/register")
			} else {
				passport.authenticate("local")(request, response, function () {
					response.redirect("/secrets")
				})
			}
		}
	)
})
app.get("/secrets", function (request, response) {
	if (request.isAuthenticated()) {
		response.render("secrets")
	} else {
		response.redirect("/login")
	}
})
app.get("/login", function (request, response) {
	response.render("login")
})
app.post("/login", function (request, response) {
	const user = new User({
		username: request.body.username,
		password: request.body.password,
	})
	request.login(user, function (err) {
		if (err) {
			console.log(err)
		} else {
			passport.authenticate("local")(request, response, function () {
				response.redirect("/secrets")
			})
		}
	})
})

app.get("/logout", function (request, response) {
	request.logout(function (err) {
		if (err) {
			console.log(err)
		} else {
			response.redirect("/")
		}
	})
})

app.listen(3000, function () {
	console.log("Server started on port 3000")
})
