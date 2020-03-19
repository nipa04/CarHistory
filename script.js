var selectedFile;
var carRecords;
var allYears = []

document
    .getElementById("fileUpload")
    .addEventListener("change", function(event) {
    selectedFile = event.target.files[0];
    });

document
    .getElementById("uploadExcel")
    .addEventListener("click", function() {
    if (selectedFile) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
        var data = event.target.result;

        var workbook = XLSX.read(data, {
            type: "binary"
        });
        workbook.SheetNames.forEach(sheet => {
            let rowObject = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[sheet]
            );

            carRecords = {}
            allYears = []

            //console.log(rowObject)
            rowObject.forEach( element => {

            // Find Fitment Description
            let items = element["Fitment Description"].split("\n")

            var prevKey = undefined;

            // We have all new line elements and now we need to process one by one
            items.forEach( item => {
                //console.log(item);
                // Year can be: 
                //  1. xxxx
                //  2. xxxx - yyyy
                // So if a line start with either of that case then it's new car description

                // Remove empty line
                if (item.length > 0) {

                // Split word by ' ' and '-' and then filter all empty word
                // What is the special character? I just copied it!!!
                var separators = [' ', '-', '–'];
                let words = item.trim().split(new RegExp(separators.join('|'), 'g')).filter(word => word.length > 0)

                // If first word is a number then it's the car identity line
                // To be a year we have 2 condition:
                //  1. It parse to int
                //  2. It length is 4 (asuming note won't have 4 digit word) 
                if (words.length > 0 && parseInt(words[0]) && words[0].length == 4 ) {

                    // Start a new car object
                    var car = {};

                    var start = parseInt(words[0]);
                    var end   = parseInt(words[0]);
                    if (parseInt(words[1]) && words[1].length == 4) {
                    end = parseInt(words[1])
                    car.make  = words[2]
                    car.model = words.slice(3).join(" ")
                    } else {
                    car.make  = words[1]
                    car.model = words.slice(2).join(" ")
                    }

                    var years = []
                    for (let year = start; year <= end; year++) {
                    years.push(year)
                    }

                    // add years property
                    car.years = years
                    // add notes property
                    car.notes = []
                    prevKey = car.make + "_" + car.model

                    // add or update existing car and model
                    carRecords[prevKey] = car
                } else {
                    carRecords[prevKey].notes.push(item)
                }
                } 
            });
            });

            for (var key in carRecords){
            let item = carRecords[key]
            item.years.forEach( year=> {
                if (allYears.includes(year) == false) {
                allYears.push(year)
                }
            })
            }

            allYears.sort()

            // Handle Year
            populateDropdown('selectYear', allYears)

            //console.log(allYears)
            console.log(carRecords)
        });
        };
        fileReader.readAsBinaryString(selectedFile);
    }
    });

    function populateDropdown(id, array) {
    var select = document.getElementById(id);
    for(var i = 0; i < array.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = array[i];
        opt.value = array[i];
        select.appendChild(opt);              
    }
    }

    function removeDropdownOptions(id) {
    var select = document.getElementById(id);
    var length = select.options.length;
    for(index = length - 1; index > 0; index--) {
        select.options[index] = null
    } 
    }

    function onSelectYear(year) {
    var allMake = []
    if (parseInt(year.value) > 0) {
        let value = parseInt(year.value)
        for (var key in carRecords){
        let item = carRecords[key]
        //console.log(item.years)
        if (item.years.includes(value) && allMake.includes(item.make) == false) {
            allMake.push(item.make)
        }
        }
    }
    allMake.sort()
    //console.log(allMake)
    removeDropdownOptions('selectMaker')
    removeDropdownOptions('selectModel')
    removeDropdownOptions('selectNote')                
    populateDropdown('selectMaker', allMake)
    }

    function onSelectMake(make) {
    var allModel = []
    let value = make.value
    for (var key in carRecords){
        let item = carRecords[key]
        //console.log(value, item.make)
        if (item.make == value) {
            allModel.push(item.model)
        }
        }

    allModel.sort()
    //console.log(allModel)
    removeDropdownOptions('selectModel')
    removeDropdownOptions('selectNote')                        
    populateDropdown('selectModel', allModel)
    }

    function onSelectModel(model) {
    var allNote = []
    let value = model.value
    for (var key in carRecords){
        let item = carRecords[key]
        if (item.model == value) {
            //console.log(item.model, value, item.notes)
            allNote = item.notes
            break
        }
    }
    //console.log(allNote)
    removeDropdownOptions('selectNote')
    populateDropdown('selectNote', allNote)
    }
