#!/usr/bin/env bash



for i in {1..5}; do
  echo $i
  curl -i \
    --header "Content-Type: application/fhir+json; charset=UTF-8" \
    --header "Accept-Charset: utf-8" \
    --header "User-Agent: HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)" \
    --request GET \
    --no-progress-meter \
    --limit-rate 10K \
    --output "slam_jhu_$i.txt" \
    http://20.119.216.32:8000/r4/CodeSystem?_summary=true &
done
