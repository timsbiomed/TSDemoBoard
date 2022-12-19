
// needs headers, now CORS stuff too? Access-Control-Allow-Origin
    const myHeaders = new Headers({
            "Accept-Charset": "utf-8",
            "Content-Type": "application/fhir+json; charset=UTF-8",
            "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"
    });

not_implemented = function(x) {
    alert(x + " is not implemented")
}

const clearDisplay = function()  {
    document.getElementById('input-system').value = ""
    document.getElementById('input-code').value = ""
    document.getElementById('output-label').value = ""
    document.getElementById('output-system').value = ""
    document.getElementById("output-synonym-heading").value = "";
    document.getElementById("output-synonym-value").value = "";
}

parse_code_systems = function(json) {
    string_rep = "" 
    
    for (obj in json.entry) {
        thing = json.entry[obj]
        
        string_rep +=  "<p>" + 
          "id: " + thing.resource.id + "<br>" +
          "url: " + thing.resource.url + "<br>" +
          "name: " + thing.resource.name + "<br>" +
          "title: " + thing.resource.title  + "<br>" +
          //"code:" + thing.entry[0].resource.meta.tag[0].code
          //"versionId:" + JSON.stringify(thing.resource.meta.versionId) + "<br>" + 
          //"system:" + JSON.stringify(thing.resource.meta.tag[0].system) + "<br>" +
          "code:" + JSON.stringify(thing.resource.meta.tag[0].code)
        string_rep += "</p>"
        
        //string_rep += JSON.stringify(thing)
    }
    
    return(string_rep)
}

query_loaded_codesystems = async(theServer) => {
    // http://20.119.216.32:8001/fhir/CodeSystem?_summary=true
    const request_string = theServer + "/CodeSystem?_summary=true" 
    alert(request_string)

    try {
        const response = await fetch(request_string, myHeaders)
        if (!response.ok) {
            alert("ERROR status:" + response.status + 
               ", text: \"" + response.statusText + "\"" +
               "\n\nCheck the code and selected vocabulary.  Most likely the code \"" + theCode + 
               "\"  wasn't found in the vocabulary \"" + theSystem + "\".");
        } else {
            const myJson = await response.json();
            var newWin = window.open()
            newWin.document.write(theServer + "<br>" + parse_code_systems(myJson))
            newWin.document.close()
        }
    }
    catch (error)  {
        alert(error + "\n That server, \"" + theServer + "\" isn't happy. Please try another, or ask for help.");
    }
}
/*******
bundle.entry[i].fullUrl
bundle.entry[i].resource.id
bundle.entry[i].resource.meta.versionId
bundle.entry[i].resource.meta.tag[0].code
bundle.entry[i].resource.url
bundle.entry[i].resource.version
bundle.entry[i].resource.name
bundle.entry[i].resource.title
bundle.entry[i].resource.date
bundle.entry[i].resource.publisher

{ "resourceType":"Bundle",
  "id":"7b424fa5-f1dd-4be4-999b-fd872d8b091c",
  "meta":{"lastUpdated":"2022-12-12T16:27:45.388-07:00",
          "tag":[{"system":"http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                  "code":"SUBSETTED",
                  "display":"Resource encoded in summary mode"}]
         },
   "type":"searchset",
   "link":[{"relation":"self","url":"http://127.0.0.1:8001/fhir/CodeSystem?_summary=true"},
           {"relation":"next","url":"http://127.0.0.1:8001/fhir?_getpages=7b424fa5-f1dd-4be4-999b-fd872d8b091c&_getpagesoffset=20&_count=20&_pretty=true&_bundletype=searchset"}],
   "entry":[{ "fullUrl":"http://127.0.0.1:8001/fhir/CodeSystem/ADAAreaOralCavitySystem",
              "resource":{"resourceType":"CodeSystem",
                          "id":"ADAAreaOralCavitySystem",
                          "meta":{"versionId":"1",
                                  "lastUpdated":"2022-11-21T16:18:20.284-07:00",
                                  "tag":[{"system":"http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                          "code":"SUBSETTED",
                                          "display":"Resource encoded in summary mode"}]
                          },
                          "url":"http://terminology.hl7.org/CodeSystem/ADAAreaOralCavitySystem",
                          "version":"1.0.0",
                          "name":"ADAAreaOralCavitySystem",
                          "title":"American Dental Association Area of Oral Cavity System",
                          "status":"active",
                          "experimental":false,
                          "date":"2022-04-07T00:00:00-00:00",
                          "publisher":"American Dental Association",
                          "contact":[{"name":"American Dental Association; 211 East Chicago Avenue Chicago, IL 60610-2678"}],
                          "caseSensitive":true,
                          "content":"not-present"
              },
              "search":{"mode":"match"}
            },
}
****/

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

const  getFhirDetail = async( theServer, theSystem, theCode) => {

    clearDisplay();

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
    
            //alert(JSON.stringify(myJson))
            var newWin = window.open()
            newWin.document.write(JSON.stringify(myJson))
            newWin.document.close()
        }
    }
    catch (error)  {
        alert(error + "\n That server, \"" + theServer + "\" isn't happy. Please try another, or ask for help.");
    }
}



find_parameter_by_name = function(params, name) {
    var label_value = '';
    for (p in params) {
        if (params[p].name == name) {
            return(params[p].valueString);
        }
    }
    return("(not found)");
}


const  getFhir = async( theServer, theSystem, theCode) => {


    clearDisplay();

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
            system_value = myJson.parameter[0].valueString
            var label_value = find_parameter_by_name(myJson.parameter, 'display');

            var my_display_string="";
            // repeating input in the DOM, should mine from returned json
            for (obj in myJson.parameter) {
                my_thing = myJson.parameter[obj]
                //alert(JSON.stringify(my_thing))

                // lots of detail here, but not a repeat of the request 
                //my_display_string += do_property(my_thing)

                // null for a short name, otherwise specify the language 
                // desig = do_designation(my_thing, "es-MX")
                desig = do_designation(my_thing, null)
                if (desig != null && desig != "") { 
                    my_desig = desig;
                    my_display_string += desig;
                }
    
            }
        
            // Assign into DOM
            document.getElementById('input-system').value = theSystem
            document.getElementById('input-code').value = theCode
    
            document.getElementById('output-system').value = system_value
            document.getElementById("output-label").value = label_value;

            if (my_desig) {
                if (my_desig[0]) {
                    document.getElementById("output-synonym-heading").value = my_desig[0];
                }
                if (my_desig[1]) {
                    document.getElementById("output-synonym-value").value = my_desig[1];
                }
            }
       
            // Definition: Q: where does this go in FHIR? a property? 
            if (false) {
                document.getElementById('output-definition-label').value = "Definition";
                document.getElementById('output-definition-value').value = label
            }
    
        }
    }
    catch (error)  {
        alert(error + "\n That server, \"" + theServer + "\" isn't happy. Please try another, or ask for help.");
    }
}

