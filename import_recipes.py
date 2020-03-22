import re
import os
import pymongo


# below establishes the connections and references the collections.
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client.recipes
ingredientsColl = db.ingredients
recipesColl = db.recipes


directory = "pepperplate_recipes/"
for filename in os.listdir(directory):
    if filename .endswith(".txt"):
        print(filename)
        with open("pepperplate_recipes/{}".format(filename), "r") as recipeFile:
            linesInFile = 0
            firstIngerdient = 0
            lastIngerdient = 0
            fileArray = []

            for line in recipeFile:
                linesInFile += 1
                fileArray.append(line)
                if "Ingredients:" in line:
                    firstIngerdient = linesInFile
                if "Instructions:" in line:
                    lastIngerdient = linesInFile - 3

            ingredients = []
            for i in range(firstIngerdient, lastIngerdient+1):
                if fileArray[i][1].isdigit():
                    ingredients.append(fileArray[i])

            instructions = ""
            lastIngerdient+3
            for i in range((lastIngerdient+3), len(fileArray)):
                instructions += "{}{}".format(fileArray[i], "\n")

        # below will create an array for the ingredients to reside in
        ingredientsArray = []

        for ingredient in ingredients:
            amountPattern = re.compile(r'\d+\s(\d+/\d+)?')
            amount = re.search(amountPattern, ingredient)

            measurementPattern = re.compile(r'\d(\s\w+\s)(.+)')
            matches = re.finditer(measurementPattern, ingredient)

            amountofIngredient = amount.group()
            for match in matches:
                measurement = match.group(1)
                ingredient = match.group(2)

            newIngredient = {
                "amount": amountofIngredient,
                "measurement": measurement,
                "ingredient":  ingredient
            }

            ingredientsColl.insert_one(newIngredient)

            ingredientsArray.append(newIngredient)

        recipe = {
            "name": filename,
            "ingredients": ingredientsArray,
            "instructions": instructions,
            "url": ""
        }

        recipesColl.insert_one(recipe)
