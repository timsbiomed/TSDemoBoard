
// needs headers, now CORS stuff too? Access-Control-Allow-Origin

const  getFhir = async() => {
    const myHeaders = new Headers({
            "Accept-Charset": "utf-8",
            "Content-Type": "application/fhir+json; charset=UTF-8",
            "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"
    });

    //const response = await fetch("http://20.119.216.32:8001/CodeSystem?_content=diabetes")
    //const response = await fetch("http://20.119.216.32:8001/CodeSystem$lookup_code=66678-4")

    const response = await fetch("http://20.119.216.32:8000/CodeSystem$lookup_code=66678-4", myHeaders)
    const myJson = await_response.json();
    alert(myJson)
}

