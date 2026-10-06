---
title: "What the road authority and the site allowed"
n: 2
params:
  kind: constraints
gist: "Four trucks on the road, three docks, volunteers who arrive at 06:00."
when: "Weeks 2–3"
constraints:
  - name: "Trucks on the public road"
    limit: "At most 4 at any time"
    type: "hard"
    source: "Road permit"
  - name: "Loading docks"
    limit: "3"
    type: "hard"
    source: "Site plan"
  - name: "Volunteers"
    limit: "9, from 06:00"
    type: "soft"
    source: "Budget"
  - name: "Drivers read the slot email"
    limit: "Slots are known in the cab"
    type: "assumed"
    source: "Unverified"
---
