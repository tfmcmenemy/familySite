
const _ = require("lodash")
const paragraph = _.split(_.split("1 lb ground pork or any other meat you would like\na bag pre-shredded cole slaw mix found in the produce section near the bagged salads\n1 1/2 cup bone broth\n1 egg\n1 tbsp soy sauce or to taste\n1/4 tbsp garlic powder or to taste\n1 tbsp ground ginger or To taste\n1/2 tsp pepper or to taste\n1/2 tsp salt or to taste",'/\n'),"\n")

let x
let errorIngredient = false
let ingredient
let ingredients = []
//
paragraph.forEach(function(result){


    errorIngredient = false
    x = result.match(/([\d\/\s]+)?\s([\w]+)\s?([\w\W\s]+)?/)

    for (var i =1; i < 4; i++){
        if (x[i]==undefined){
            errorIngredient = true
        }
    }
    if (errorIngredient == false){
            ingredient = {
                amount: x[1],
                measurement: x[2],
                name: x[3]
            }
    } else {
        ingredient = {
            amount: "",
            measurement: "",
            name: result
        }
    }
    ingredients.push(ingredient)

})

console.log(ingredients);
