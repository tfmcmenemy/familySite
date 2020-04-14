import re

# string = "HelloWorld"
#
# pattern = re.compile(r'([A-Z][a-z]+)')
#
# results = re.findall(pattern, string)
#
# resultString = ""
#
# for result in results:
#     resultString += " " + result
#
# print(resultString.strip())


def stripWord(word):
    pattern = re.compile(r'(\d+)\s+(.+)')

    results = re.findall(pattern, word)

    resultString = ""

    i = 0
    for result in results:
        for item in result:
            print(result[i])
            i += 1


stripWord("2 1/4")
