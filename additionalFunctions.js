//jshint esversion:6

module.exports.getDayOfTheWeek = getDayOfTheWeek
module.exports.convertDate = convertDate


function getDayOfTheWeek(date) {
    days = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
        7: "Sunday"
    }
    return days[date.getDay()]
}


function convertDate(date){
    if (date.getMonth() < 10) {
        month = `0${date.getMonth() +1}`
    } else {
        month = date.getMonth() +1
    }

    if (date.getDate() < 10) {
        day = `0${date.getDate()}`
    } else {
        day = date.getDate()
    }

    let newDate = `${date.getFullYear()}-${month}-${day}`
    return newDate
}
