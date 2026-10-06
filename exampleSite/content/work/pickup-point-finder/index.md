---
title: "Pickup Point Finder"
summary: "Support contacts about missing parcels fell 45% after the pickup flow was rebuilt around the question people actually ask."
brief: "People could not tell which pickup point held their parcel, so they wrote to support instead."
date: 2025-03-10
weight: 30
role: "Product designer (sole)"
client: "Parcelo"
disciplines: ["product-design"]
stack: ["Figma", "Maze", "Amplitude"]
cover:
  image: "cover.jpg"
  alt: "Two phone screens side by side: the old parcel status page and the new pickup point card."
barcode:
  duration: "11 weeks"
  team: 3
  outcome:
    value: "−45"
    unit: "%"
    label: "\"where is my parcel\" contacts"
result:
  headline: "Fewer people had to ask where their parcel was."
  metrics:
    - value: "21"
      label: "Contacts per 1,000 parcels"
      context: "Was 38."
    - value: "41"
      unit: "s"
      label: "Time to find the parcel"
      context: "Was 94 s in moderated tests."
  outcome: |
    The tracking page now opens on one card: the pickup point, its opening hours, and a map pin.
    The status history moved below it.
---

## The brief

Parcelo's tracking page listed every scan event in order. The one thing people needed, where to
collect the parcel, was the seventh line.

![The old tracking flow, annotated](shots/flow-before.png#wide "Before: the pickup point is the seventh line of a scan history.")

## What changed

The pickup point became the first thing on the page, with its opening hours and a map pin. The scan
history is still there, below it, for the people who want it.

![The new tracking flow, annotated](shots/flow-after.png#wide "After: the pickup point card is the first thing on the page.")

*Parcelo and every figure on this page are fictional; they demonstrate the theme.*
