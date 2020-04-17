import re
import os
import pymongo
import gridfs
import urllib

username = urllib.quote_plus('admin-tom')
password = urllib.quote_plus('MOnkey@!21')

# below establishes the connections and references the collections.
client = pymongo.MongoClient('mongodb+srv://'+ username +':'+ password +'@mcmenemyfamily-database-ht0pj.mongodb.net/mcmenemy-family')
db = client.mcmenemyFamily
recipesColl = db.recipes

# below is setting up the connection for gridsfs
fs = gridfs.GridFS(db)

def stripWord(word):
    word = word[0:len(word)-3] #removes the '.txt' off of the file

    pattern = re.compile(r'[A-Z\sa-z][a-z]+')

    results = re.findall(pattern, word)

    resultString = ""

    for result in results:
        resultString += " " + result

    return resultString.strip()


directory = "pepperplate_recipes/"
for filename in os.listdir(directory):

    if filename .endswith(".txt"):
        file_id = fs.put(open("pepperplate_recipes/{}".format(filename), "r"))

        with open("pepperplate_recipes/{}".format(filename), "r") as recipeFile:
            linesInFile = 0
            firstIngerdient = 0
            lastIngerdient = 0
            fileArray = []

            for line in recipeFile:
                linesInFile += 1
                fileArray.append(line.strip())
                if "Ingredients:" in line:
                    firstIngerdient = linesInFile
                if "Instructions:" in line:
                    lastIngerdient = linesInFile - 3

            ingredients = []
            for i in range(firstIngerdient, lastIngerdient+1):
                # if fileArray[i][1].isdigit():
                ingredients.append(fileArray[i])

            instructions = []
            # lastIngerdient+3
            for i in range((lastIngerdient+3), len(fileArray)):
                if len(fileArray[i]) > 0:
                    instructions.append(fileArray[i])



                        # Below was removed because we no longer need it. Instead of breaking recipe ingredients down by amount
                        # measurement and name
                        # below will create an array for the ingredients to reside in
                        # ingredientsArray = []
                        # for ingredient in ingredients:
                        #     amountPattern = re.compile(r'\d+\s(\d+/\d+)?')
                        #     amount = re.search(amountPattern, ingredient)
                        #
                        #     measurementPattern = re.compile(r'\d(\s\w+\s)(.+)')
                        #     matches = re.finditer(measurementPattern, ingredient)
                        #
                        #     amountofIngredient = amount.group()
                        #     for match in matches:
                        #         measurement = match.group(1)
                        #         ingredient = match.group(2)
                        #
                        #     newIngredient = {
                        #         "amount": amountofIngredient,
                        #         "measurement": measurement,
                        #         "ingredient":  ingredient
                        #     }
                        #
                        #     ingredientsColl.insert_one(newIngredient)
                        #
                        #     ingredientsArray.append(newIngredient)

        if len(ingredients) == 0 | len(instructions) == 0 | len(stripWord(filename)) == 0:
            print(filename)

        recipe = {
            "name": stripWord(filename),
            "ingredients": ingredients,
            "instructions": instructions,
            "url": "",
            "author": "Mom",
            "tags": ["mom", "pepperplate", "imported"],
            "file": file_id
        }

        recipesColl.insert_one(recipe)
