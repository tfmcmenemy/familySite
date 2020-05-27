//jshint esversion:6

const express = require("express"); //REQUIRED - neede to use Express.js
const bodyParser = require("body-parser"); //REQUIRED - need for returning body items
const mongoose = require("mongoose") //REQUIRED - needed to greate mongoDB databases
const _ = require("lodash")
const date = require('date-and-time')
const additionalFunctions = require(__dirname + "/additionalFunctions.js")

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
// mongoose.connect('mongodb://localhost:27017/quiz', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// mongoose.connect('mongodb+srv://admin-tom:MOnkey@!21@mcmenemyfamily-database-ht0pj.mongodb.net/mcmenemyFamily', {
mongoose.connect('mongodb://localhost:27017/recipes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// mongoose.connect('mongodb://localhost:27017/meals', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

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

const recipeSchema = new mongoose.Schema({
    name: String,
    ingredients: [String],
    instructions: [String],
    tags: [String],
    url: String,
    author: String,
    file: String,
    deleted: Boolean,
    category: String
})

const mealSchema = new mongoose.Schema({
    date: Date,
    meal: String,
    associateRecipe: String,
    ingredientsPurchased: Boolean,
    notes: String
})

const Question = mongoose.model("Question", questionSchema)
const Recipe = mongoose.model("Recipe", recipeSchema)
const Meal = mongoose.model("Meal", mealSchema)


app.get("/", function(req, res) {
    console.log('Someone connected to the server');
    res.render("home")
})

app.get("/add_recipe", function(req, res) {
    Recipe.find({}, null, {
        sort: {
            name: 1
        }
    }, function(err, allRecipes) {
        res.render("add_recipe", {
            allRecipes: allRecipes
        })
    })
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

app.get("/selected_recipe/:recipeID", function(req, res) {
    recipeID = req.params.recipeID
    // let assRecipes =[]
    // let toAdd
    Recipe.findOne({
        _id: recipeID
    }, function(err, recipeResult) {
        if (!err) {
            res.render("view_selected_recipe", {
                recipe: recipeResult
            })
        }
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

app.get("/view_recipes", function(req, res) {
    var alphabeticalOrder = []
    var recipes = []
    let authors = []
    Recipe.find({
        deleted: false
    }, null, {
        sort: {
            name: 1
        }
    }, function(err, allRecipes) {
        allRecipes.forEach(function(x) {
            alphabeticalOrder.push(x.name)
        })

        allRecipes.forEach(function(recipe) {
            if (!authors.includes(recipe.author)) {
                authors.push(recipe.author)
            }
        })
        console.log(authors.length);
        res.render("view_recipes", {
            recipes: allRecipes,
            authors: authors
        })
    })
})

app.get('/view_selected_recipe', function(req, res) {

    Recipe.findOne({
        _id: "5e906b576e5eea340f6a6df6"
    }, function(err, recipeResult) {
        if (!err) {
            console.log(recipeResult)
            res.render("view_selected_recipe", {
                recipe: recipeResult
            })
        }
    })
})


app.post("/_questions", function(req, res) {
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
    const ingredientsPulled = _.split(req.body.ingredients, "\r\n")
    let ingredient
    const ingredients = []
    const tags = []
    const instructions = _.split(req.body.instructions, "\r\n")
    let x
    let errorIngredient = false

    // below will take all of the tags from the recipe it will break up the String
    // that is returned, and the save them to the tags array.
    _.split(req.body.tags, ", ").forEach(function(x) {
        tags.push(_.capitalize(x))
    })

    const recipe = new Recipe({
        name: req.body.name,
        ingredients: ingredientsPulled,
        instructions: instructions,
        tags: tags,
        url: req.body.URL,
        author: _.capitalize(req.body.author),
        deleted: false
    })

    recipe.save()

    res.redirect("/add_recipe")
})

app.post("/select_recipe", function(req, res) {
    // console.log(req.body.selectedRecipe);
    console.log(req.body);

    res.redirect("/selected_recipe/" + req.body.selectedRecipe)
})

app.post("/edit_recipe", function(req, res) {
    let recipeID = req.body.editButton
    Recipe.findOne({
        _id: recipeID
    }, function(err, recipeToEdit) {
        if (!err) {
            res.render("update_recipe", {
                recipe: recipeToEdit
            })
        }
    })
})

app.post("/submit_updated_recipes", function(req, res) {
    ingredients = []
    console.log(req.body);
    ingredientstoPush = req.body.ingredient

    for (var i = 0; i < ingredientstoPush.length; i++) {
        ingredients.push(ingredientstoPush[i])
    }

    _.split(req.body.ingredients, "\r\n").forEach(function(ing) {
        if (ing.length > 0) {
            ingredients.push(ing)
        }
    })
    console.log(ingredients);

    instructions = _.split(req.body.instructions, "\r\n")

    Recipe.updateOne({
        _id: req.body.id
    }, {
        url: req.body.URL
    }, function(err, result) {})
    Recipe.updateOne({
        _id: req.body.id
    }, {
        instructions: instructions
    }, function(err, result) {})
    Recipe.updateOne({
        _id: req.body.id
    }, {
        ingredients: ingredients
    }, function(err, result) {})
    Recipe.updateOne({
        _id: req.body.id
    }, {
        name: req.body.name
    }, function(err, result) {})
    Recipe.updateOne({
        _id: req.body.id
    }, {
        author: req.body.author
    }, function(err, result) {})
    res.redirect("/selected_recipe/" + req.body.id)
})

app.post("/delete_me", function(req, res) {
    console.log(req.body);

    Recipe.updateOne({
        _id: req.body.to_delete
    }, {
        deleted: true
    }, function(err, report) {})
    res.redirect("/view_recipes")
})


///////////////////////////
//////     REST     ///////
///////////////////////////

app.get("/api/recipes/:id", function(req, res) {

    let id = req.params.id

    Recipe.findOne({
        _id: id
    }, function(err, result) {
        if (!err) {
            res.send(result)
        } else {
            res.send(err)
        }
    })
})

app.get("/fetch", function(req, res) {
    Recipe.find({}, function(err, recipes) {
        res.render("fetch_test", {
            recipes: recipes
        })
    })
})


app.route("/menu")
    .get(function(req, res) {

        let d = new Date("2020-04-25")
        console.log(`${additionalFunctions.getDayOfTheWeek(d)}   ${d}`);

        function getRecipes() {
            return new Promise((resolve) => {
                Recipe.find().sort("name").exec((err, results) => {
                    resolve(results)
                })
            })
        }

        function getMeals() {
            return new Promise(resolve => {
                let d = new Date()
                d.setDate(d.getDate() - 1)
                Meal.find({
                    date: {
                        $gt: d
                    }
                }).sort("date").exec(function(err, results) {
                    resolve(results)
                })
            })
        }

        async function renderSite() {
            let recipes = await getRecipes()
            let meals = await getMeals()
            res.render("menu", {
                recipes: recipes,
                meals: meals,
                convertDate: additionalFunctions.convertDate,
                getDayOfTheWeek: additionalFunctions.getDayOfTheWeek
            })
        }

        renderSite()
    })


    .post(function(req, res) {
        Meal.findOne({
            _id: req.body.id
        }, function(err, results) {
            if (results) {
                Meal.updateOne({
                    _id: req.body.id
                }, {
                    date: req.body.date,
                    meal: req.body.meal,
                    associateRecipe: req.body.associateRecipe,
                    ingredientsPurchased: req.body.ingredientsPurchased,
                    notes: req.body.notes
                }, function(err) {
                    if (err) {
                        console.log(err)
                    }
                })
            } else {
                newMeal = new Meal({
                    date: req.body.date,
                    meal: req.body.meal,
                    associateRecipe: req.body.associateRecipe,
                    ingredientsPurchased: req.body.ingredientsPurchased,
                    notes: req.body.notes
                })
                newMeal.save()
                res.send(newMeal._id)
                console.log(newMeal._id);
            }
        })
    })

    .delete(function(req, res) {
        Meal.deleteOne({
            _id: req.body.id
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Meal on succssfully deleted.`);
            }
        })
        res.send("Deleted")
    })

app.get("/checkForDuplicates", function(req, res) {

    function numberOfTimesInAnArray(value, array) {
        let count = 0
        array.forEach(function(itter) {
            if (itter == value) {
                count++
            }
        })
        return count
    }

    function addToArray(array) {
        let newArr = []
        array.forEach(function(val) {
            newArr.push(val.name)
        })
        return newArr
    }

    Recipe.find({}, function(err, results) {
        let names = addToArray(results)
        names.forEach(function(name) {
            if (numberOfTimesInAnArray(name, names) > 1) {
                console.log(name)
            }
        })
    })
})

app.get("/addMeal", function(req, res) {
    newMeal = new Meal({
        date: "2020-05-29",
        meal: "Tacos",
        associateRecipe: "",
        ingredientsPurchased: true,
        notes: "these are some notes about the meal."
    })
    newMeal.save()
})

app.get("/bulk", function(req, res) {
    let thing = function (){
        
    }
    Recipe.find({}, function(err, results) {
        res.render("bulkedit", {
            recipes: results
        })
    })
})

app.post("/bulk", function(req, res) {
    for (var key in req.body) {
        if(key != "button"){
            if (req.body.hasOwnProperty(key)) {
                Recipe.updateOne({_id:key},{category:req.body[key]},function(err, results){})
            }
        }
    }
})


app.listen(process.env.PORT || 3000, function() {
    console.log("Running on post 3000");
});
