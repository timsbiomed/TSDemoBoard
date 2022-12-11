
// needs headers, now CORS stuff too? Access-Control-Allow-Origin
    const myHeaders = new Headers({
            "Accept-Charset": "utf-8",
            "Content-Type": "application/fhir+json; charset=UTF-8",
            "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"
    });

not_implemented = function(x) {
    alert(x + " is not implemented")
}

query_loaded_codesystems = async(theServer) => {
    // http://20.119.216.32:8001/r4/CodeSystem?_summary=true
    const request_string = theServer + "/CodeSystem?_summary=true" 
    alert(request_string)
    const response = await fetch(request_string, myHeaders)
    const myJson = await response.json();
    alert(JSON.stringify(myJson))

}

do_property = function(myJson) {
        var my_display_string="";
            if (my_name == 'property') {
                //alert(JSON.stringify(myJson.parameter[obj]))
                // name:code, valueCode:CLASSTYPE, name:value, valueString:2
                // name:code, valueCode:VersionLastChanged, name:value, valueString:2.65
                // name:code, valueCode:STATUS, name:value, valueString:TRIAL
                // name:code, valueCode:VersionFirstReleased, name:value, valueString:2.38
                // name:code, valueCode:parent
                // name:code, valueCode:answer-list
                // name:code, valueCode:COMPONENT
                // name:code, valueCode:PROPERTY
                // name:code, valueCode:TIME_ASPCT
                // name:code, valueCode:SYSTEM
                // name:code, valueCode:SCALE_TYP
                // name:code, valueCode:METHOD_TYP
                // name:code, valueCode:analyte
                // name:code, valueCode:time-core
                // name:code, valueCode:super-system
                // name:code, valueCode:analyte-core
                // name:code, valueCode:category
                // {"name":"property",
                //  "part":[
                //      {"name":"code","valueCode":"CLASS"},
                //      {"name":"value","valueCoding":{
                //                      "system":"http://loinc.org", "code":"LP95321-3", "display":"PHENX"} 
                //      } 
                //  ] 
                // }
                for (my_part_idx in  myJson.parameter[obj].part) {
                    my_part = myJson.parameter[obj].part[my_part_idx]
                    if (my_part.name == 'value') {
                        my_display_string = my_display_string 
                            + "System:" + my_part.valueCoding.system 
                            + "\nCode: " + my_part.valueCoding.code  
                            + "\nDisplay:" + my_part.valueCoding .display
                            + "\n";
                    }
                    if (my_part.name == 'code' && my_part.valueCode != 'CLASS') {
                        break;
                    }
                    else if (my_part.name == 'code' && my_part.valueCode == 'CLASS') {
                        //alert("CLASS  " + JSON.stringify(my_part))
                    }
                }
            }
    return(my_display_string);
}

do_designation = function(myJson) {
        var my_display_string="";
            if (my_name == 'designation') {
               my_display_string = my_display_string + "SYNONYM: " 
               my_part = myJson.parameter[obj].part
               for (desig_index in my_part) {
                 designation_part = my_part[desig_index];
                 if (designation_part.name == 'name') {
                   my_display_string = my_display_string + " name: " + designation_part.valueString + "\n";
                 }
                 else if (designation_part.name == 'language') {
                    if (designation_part.valueCode != null | designation_part.valueCode == 'undefined') { 
                        my_display_string = my_display_string + " Language: " + designation_part.valueCode + "\n ";
                    }
                    //else { my_display_string = my_display_string + "--- " }
                 } 
                 else if (designation_part.name == 'value') {
                   my_display_string = my_display_string + " "  + designation_part.valueString + "\n";
                 } 
                 else if (designation_part.name == 'use') {
                   my_display_string = my_display_string +  designation_part.valueCoding.display + ": ";
                 } 
                 else {
                   my_display_string = my_display_string + " XX value: " + JSON.stringify(designation_part) + "\n";
                 } 
               }
               my_display_string = my_display_string + "\n"
              // for (key in Object.keys(myJson.parameter) ) {
            }
    return(my_display_string);
}


const  getFhir = async( theServer, theSystem, theCode) => {

    document.getElementById('output-system').value = ""
    document.getElementById('output-code').value =  ""
    document.getElementById('output-label').value =  ""

    const base_str = theServer + "/CodeSystem/$lookup?"  // why the /$?
    const system_str = "system=" + theSystem
    const code_str = "&code=" + theCode
    const requestString = base_str + system_str + code_str

    var response;
    try {
        response = await fetch(requestString, myHeaders)
        if (!response.ok) {
            alert("ERROR status:" + response.status + 
               ", text: \"" + response.statusText + "\"" +
               "\n\nCheck the code and selected vocabulary.  Most likely the code \"" + theCode + 
               "\"  wasn't found in the vocabulary \"" + theSystem + "\".");
        } else {
            const myJson = await response.json();
            label = myJson.parameter[1].valueString
    
            var my_display_string="";
    
            // repeating input in the DOM, should mine from returned json
            for (obj in myJson.parameter) {
                my_name = myJson.parameter[obj].name
                if (my_name == 'name') {
                    my_display_string = my_display_string + "Vocab: " + myJson.parameter[obj].valueString + "\n";
                }
                if (my_name == 'display') {
                    my_display_string = my_display_string + "Concept name: " + myJson.parameter[obj].valueString + "\n";
                }
    
                my_display_string += do_property(myJson)
                my_display_string += do_designation(myJson)
    
            }
        
            // Assign into DOM
            document.getElementById('input-system').value = theSystem
            document.getElementById('input-code').value = theCode
    
            document.getElementById('output-system').value = theSystem // to-do
            document.getElementById('output-code').value = theCode // to-do
            document.getElementById('output-label').value = label
    
            alert(my_display_string)
        }
    }
    catch (error)  {
        alert(error + "\n That server, \"" + theServer + "\" isn't happy. Please try another, or ask for help.");
    }

}
