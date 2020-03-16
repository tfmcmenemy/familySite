//jshint esversion:6

const express = require("express"); //REQUIRED - neede to use Express.js
const bodyParser = require("body-parser"); //REQUIRED - need for returning body items
const mongoose = require("mongoose") //REQUIRED - needed to greate mongoDB databases
const _ = require("lodash")

const app = express(); //REQUIRED - declaring express as an app

///////////////////////////////////////////////////
//This section is setting up some needed files.
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
////////           Database                 ///////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/quiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connect('mongodb://localhost:27017/recipes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


/////Schema
const questionSchema = new mongoose.Schema({
    subject: String,
    nameForHTML: String,
    question: String,
    correctAnswer: String,
    answer2: String,
    answer3: String,
    answer4: String
})

const ingredientSchema = new mongoose.Schema({
    amount: Number,
    measurement: String,
    ingredient: String
})

const recipeSchema = new mongoose.Schema({
    name: String,
    ingredients: [ingredientSchema],
    instructions: String,
    tags: [String],
    url: String
})

const Question = mongoose.model("Question", questionSchema)
const Ingredient = mongoose.model("Ingredient", ingredientSchema)
const Recipe = mongoose.model("Recipe", recipeSchema)

app.get("/", function(req, res) {
    res.render("home")
})

app.get("/add_recipe", function(req, res) {
    res.render("add_recipe")
})

app.get("/add_questions", function(req, res) {
    // below will get a list of the previously used subjects, and add them to the dropdown.
    const subjects = []
    Question.find({}, function(err, results) {
        if (!err) {
            results.reverse().forEach(function(result) {
                if (subjects.indexOf(result.subject) === -1) {
                    subjects.push(result.subject)
                }
            })
        }
        res.render("add_questions", {
            subjects: subjects
        })
    })
})

app.get("/select_test", function(req, res) {
    const subjects = {}
    const names = {}
    Question.find({}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            results.forEach(function(result) {
                if (result.subject in subjects) {
                    subjects[result.subject] += 1
                } else {
                    subjects[result.subject] = 1
                    names[result.subject] = result.nameForHTML
                }

            })
            //below will make all of the subjects in alphabetical order.
            const alphabeticalOrder = []
            const sortedSubjects = {}
            for (var subject in subjects) {
                alphabeticalOrder.push(subject)
            }
            alphabeticalOrder.sort()
            alphabeticalOrder.forEach(function(subject) {
                sortedSubjects[subject] = subjects[subject]
            })

            //below will push the subjects to the site
            res.render("select_test", {
                subjects: sortedSubjects,
                name: names
            })
        }
    })
})

app.post("/add_questions", function(req, res) {
    var sub
    if (req.body.subject.length > 1) {
        sub = _.capitalize(req.body.subject)
    } else {
        sub = req.body.subjectDropdown
    }
    console.log(sub);

    const question = new Question({
        subject: sub,
        nameForHTML: _.replace(sub, " ", ""),
        question: req.body.question,
        correctAnswer: req.body.correctAnswer,
        answer2: req.body.answer2,
        answer3: req.body.answer3,
        answer4: req.body.answer4
    })

    question.save()

    console.log("One question has been saved.");
    res.redirect("/add_questions")
})

app.post("/select_test", function(req, res) {
    var selection = ""
    var questionBankArr = []

    for (var x in req.body) {
        selection = x
    }
    Question.find({
        nameForHTML: selection
    }, function(err, results) {
        if (!err) {
            results.forEach(function(question) {
                questionBankArr.push(results.nameForHTML)
            })
        }
    })
    res.render("take_test")
})

app.post("/add_recipe", function(req, res) {
    const ingredients = []
    const tags = []

    console.log(req.body);

    for (var i = 0; i < req.body.amount.length; i++) {
        const ingredient = new Ingredient({
            amount: req.body.amount[i],
            measurement: req.body.measurement[i],
            ingredient: _.lowerCase(req.body.ingredient[i])
        })
        ingredient.save()
        ingredients.push(ingredient)
    }

    _.split(req.body.tags,", ").forEach(function(x){
        tags.push(_.lowerCase(x))
    })

    const recipe = new Recipe({
        name: req.body.name,
        ingredients: ingredients,
        instructions: req.body.instructions,
        tags: tags,
        url: req.body.URL
    })

    recipe.save()
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Running on post 3000");
});
