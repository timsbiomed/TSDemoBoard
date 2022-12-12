
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

do_property = function(my_thing) {
    var my_display_string="";
    if (my_thing.name == 'property') {
        // name:code, valueCode: VVVV, (name:value, valueString:XXX)
        // VVVV one of :
        //   CLASSTYPE, VersionLastChanged, STATUS, VersionFirstReleased, 
        //   parent, answer-list, COMPONENT, PROPERTY, TIME_ASPCT, SYSTEM,
        //   SCALE_TYP, METHOD_TYP, analyte, time-core, super-system,
        //   analyte-core
        // name:code, valueCode:category
        // {"name":"property",
        //  "part":[
        //      {"name":"code","valueCode":"CLASS"},
        //      {"name":"value","valueCoding":{
        //                      "system":"http://loinc.org", "code":"LP95321-3", "display":"PHENX"} 
        //      } 
        //  ] 
        // }
        for (my_part_idx in  my_thing.part) {
            my_part = my_thing.part[my_part_idx]
            // skip anything that is not what we're looking for
            if (my_part.name == '\ncode' && my_part.valueCode != 'CLASS') {
                break;
            }
            else {
                my_display_string += "code CLASS: " + JSON.stringify(my_part)
            }
            if (my_part.name == 'value') {
                //my_display_string += "\nvalue...: " + JSON.stringify(my_part)
            }
            //if (my_part.name == 'value') {
            //    my_display_string = my_display_string 
            //        + "System:" + my_part.valueCoding.system 
            //        + "\nCode: " + my_part.valueCoding.code  
            //        + "\nDisplay:" + my_part.valueCoding .display
            //        + "\n";
            // }
            //else if (my_part.name == 'code' && my_part.valueCode == 'CLASS') {
            //    //alert("CLASS  " + JSON.stringify(my_part))
            //}
        }
    }
    return(my_display_string);
}

do_designation = function(my_thing, ) {
    return do_designation(my_thing, null)
}

do_designation = function(my_thing, desired_lang ) {
    desig_parts = null;
    if (my_thing.name == 'designation') {
        my_part = my_thing.part
        my_lang = false;
        my_use = "n/a";
        my_value = "n/a";
        // first check to see if this designation has the language value of interest.
        for (desig_index in my_part) {
            designation_part = my_part[desig_index];
            if (designation_part.name == 'language' & designation_part.valueCode == desired_lang) {
                my_lang = true;
                if (designation_part.valueCode != null) {
                   //" Language: " + designation_part.valueCode;
                }
            } 
        }

        // then print the detail 
        if (my_lang) {
            for (desig_index in my_part) {
                designation_part = my_part[desig_index];
                if (designation_part.name == 'name'){
                    // " name: " + designation_part.valueString + "\n";
                }
                else if (designation_part.name == 'value') {
                    my_value = designation_part.valueString + "\n";
                } 
                else if (designation_part.name == 'use'){
                    my_use =  designation_part.valueCoding.display + ": ";
                } 
            }
            desig_parts = [my_use, my_value]
        }
    }
    return(desig_parts);
}


const  getFhir = async( theServer, theSystem, theCode) => {

    document.getElementById('input-system').value = ""
    document.getElementById('input-code').value = ""

    document.getElementById('output-system').value = ""
    document.getElementById('output-code').value =  ""
    document.getElementById('output-label').value =  ""
    document.getElementById("output-synonym-heading").value = "";
    document.getElementById("output-synonym-value").value = "";

    const base_str = theServer + "/CodeSystem/$lookup?"  // why the /$?
    const system_str = "system=" + theSystem
    const code_str = "&code=" + theCode
    const requestString = base_str + system_str + code_str

    var response;
    try {
        response = await fetch(requestString, myHeaders)
        my_desig = []
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
                my_thing = myJson.parameter[obj]

                my_display_string += "Vocab: " + my_thing.valueString + "\n";

                my_display_string += "Concept name: " + my_thing.valueString + "\n";

                // lots of detail here, but not a repeat of the request 
                //my_display_string += do_property(my_thing)

                // null for a short name, otherwise specify the language 
                // desig = do_designation(my_thing, "en-MX")
                desig = do_designation(my_thing, null)
                if (desig != null && desig != "") { 
                    my_desig = desig;
                    my_display_string += desig;
                }
    
            }
        
            // Assign into DOM
            document.getElementById('input-system').value = theSystem
            document.getElementById('input-code').value = theCode
    
            //document.getElementById('output-system').value = theSystem // to-do
            //document.getElementById('output-code').value = theCode; // to-do
            document.getElementById("output-label").value = label;

            if (my_desig) {
                if (my_desig[0]) {
                    document.getElementById("output-synonym-heading").value = my_desig[0];
                }
                if (my_desig[1]) {
                    document.getElementById("output-synonym-value").value = my_desig[1];
                }
            }
            //document.getElementById('output-definition').value = label
    
            //alert(my_display_string)
        }
    }
    catch (error)  {
        alert(error + "\n That server, \"" + theServer + "\" isn't happy. Please try another, or ask for help.");
    }

}
