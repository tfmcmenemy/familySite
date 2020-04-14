import re
import os
import pymongo


# below establishes the connections and references the collections.
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client.recipes
# ingredientsColl = db.ingredients
recipesColl = db.recipes


def stripWord(word):
    pattern = re.compile(r'([A-Z][a-z]+)')

    results = re.findall(pattern, word)

    resultString = ""

    for result in results:
        resultString += " " + result
    return resultString.strip()


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
            for i in range(firstIngerdient, lastIngerdient + 1):
                if fileArray[i][1].isdigit():
                    ingredients.append(fileArray[i])

            instructions = []
            # lastIngerdient+3
            for i in range((lastIngerdient + 3), len(fileArray)):
                instructions.append(fileArray[i].strip())

        with open("pepperplate_recipes/{}".format(filename), "r") as recipeFile:
            text = recipeFile.read()
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

            ingredientsArray.append({
                "amount": amountofIngredient,
                "measurement": measurement.strip(),
                "name":  ingredient.strip()
            })

        recipe = {
            "name": stripWord(filename),
            "ingredients": ingredientsArray,
            "instructions": instructions,
            "tags": ['mom', 'pepperplate', 'imported'],
            "file": {
                "fileName": filename,
                "contents": text
            }
        }

        recipesColl.insert_one(recipe)
