#!/usr/bin/env bash



for i in {1..50}; do
  echo $i
  curl -i \
    --header "Content-Type: application/fhir+json; charset=UTF-8" \
    --header "Accept-Charset: utf-8" \
    --header "User-Agent: HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)" \
    --request GET \
    --no-progress-meter \
    --limit-rate 1K \
    --output "slam_local_$i.txt" \
    http://localhost:8088/fhir/CodeSystem?_summary=true &  2> /dev/null > /dev/null
done
