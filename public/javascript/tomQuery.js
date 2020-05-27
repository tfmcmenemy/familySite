

//////////////////////////////////////////////////////
// Moving through the DOM
//////////////////////////////////////////////////////

    //Below will find a parent with a given ID of a passed element.
    //This will traverse the DOM moving up.
    function findSpecificParentByID(startingElement, parentID){
        let parentFound = false
        let currentParent = startingElement

        while (parentFound == false) {
            try{
                currentParent = currentParent.parentElement
                if (currentParent.id == parentID){
                    parentFound = true
                }
            } catch (error) {
                break
                console.log(error)
            }

        }
        return currentParent
    }

//////////////////////////////////////////////////////
// Date Functions
//////////////////////////////////////////////////////
    function getDayOfTheWeek(date) {
        days = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
        }
        return days[date.getDay()]
    }
