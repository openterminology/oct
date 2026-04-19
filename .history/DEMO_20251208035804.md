# Octo UI Demo

![Octo UI Demo](static/2025-12-07.gif)

> **⚠️ Important Notice:** The data displayed in this UI is for demonstration purposes only and has not been clinically validated. This is a mock dataset and should not be used for clinical decision-making or medical diagnosis.

## Starting the Server

```bash
docker compose up -d caddy
```

## Accessing the UI

Navigate to: http://localhost/octopus.html

## Demo Workflow

1. **Enter FHIR Server URL** (default: https://tx.ontoserver.csiro.au/fhir)
2. **Enter Concept ID** (example: 138875005 - SNOMED CT code)
3. **Enter System** (default: http://snomed.info/sct)
4. **Click "Lookup"**
5. **View Results:**
   - Display name and designations
   - Properties and metadata
   - Raw JSON response

## Tree Visualization

Visit: http://localhost/tree-preact.html

- Expand/collapse nodes
- Interactive D3-based tree view



