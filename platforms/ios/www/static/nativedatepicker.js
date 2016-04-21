DATE_SEPARATOR = '-';
TIME_SEPARATOR = ':';
LOCALIZED_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
ISO_DATA_NAME = 'iso';

function pad(n) { return ("0" + n).slice(-2); }

function getDateString(date) {
    var day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear(),
        monthStr = LOCALIZED_MONTH_NAMES[month];

    // return monthStr + ' ' + day + ', ' + year;
    return year + "-" + ("00" + (month + 1)).substr(-2,2) + "-" + day;
}

function getTimeString (date) {
    return date.getHours() + TIME_SEPARATOR + pad(date.getMinutes());
}

function setDateOnField(date, field, mode) {
    // set human readable (localized) date
    var newDate = new Date(date);

    var dateString;
    switch (mode) {
        case 'date':
            dateString = getDateString(newDate);
            break;
        case 'time':
            dateString = getTimeString(newDate);
            break;
        default: //datetime
            dateString = getDateString(newDate) + ' ' + getTimeString(newDate);
    }

    field.val(dateString);
}

function getISODateFromField(field) {
    return field.data(ISO_DATA_NAME);
}

function setISODateOnField(date, field) {
    var isoStr = new Date(Date.parse(date)).toISOString();
    field.data(ISO_DATA_NAME, isoStr);
}

function showDatePicker(currentField, mode) {
    var myNewDate,
        isoDate = getISODateFromField(currentField);

    // get or create Date-object
    if (isoDate) { myNewDate = new Date(isoDate); }
    else myNewDate = new Date();

    var options = {
        date: myNewDate,
        mode: mode,      // options: 'date', 'time', 'datetime'
        x: currentField.offset().left + currentField.outerHeight()/2,
        y: currentField.offset().top + currentField.outerHeight()/2
    };

    // Same handling for iPhone and Android
    window.datePicker.show(options, function(date) {
        setDateOnField(date, currentField, mode);
        setISODateOnField(date, currentField);
        // This fixes the problem you mention at the bottom of this script with it not working a second/third time around, because it is in focus.
        currentField.blur();
    });
}

//NOTE: The cordova-datepicker-plugin does not support datetime natively, because Android itself doesn't have a widget for it, like iOS has.
//      This way, we just glue a date-picker and time-picker together to form a datetime-picker.
function showDateTimePicker(currentField) {
    var myNewDate,
        isoDate = getISODateFromField(currentField);

    // get or create Date-object
    if (isoDate) { myNewDate = new Date(isoDate); }
    else myNewDate = new Date();

    var optionsDate = {
        date: myNewDate,
        mode: 'date'      // options: 'date', 'time', 'datetime'
    };
    var optionsTime = jQuery.extend(true, {}, optionsDate); //clone
    optionsTime.mode = 'time';

    // Same handling for iPhone and Android
    window.datePicker.show(optionsDate, function(date) {
        var result = new Date(date);

        //preset hours/minutes to existing values if set
        date = new Date();
        if (isoDate) {
            date.setMinutes(new Date(isoDate).getMinutes());
            date.setHours(new Date(isoDate).getHours());
        }
        optionsTime.date = date;

        window.datePicker.show(optionsTime, function (time) {
            //update our resultDate with time-results (disregard date-part of this result, it returned today's date)
            time = new Date(time);

            result.setMinutes(time.getMinutes());
            result.setHours(time.getHours());

            setDateOnField(result, currentField, 'datetime');
            setISODateOnField(result, currentField);
        });

        // This fixes the problem you mention at the bottom of this script with it not working a second/third time around, because it is in focus.
        currentField.blur();
    });
}
