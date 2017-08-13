const ProcessCSV = require('./ProcessCSV').ProcessCSV;

function processBuilding() {
    const dataLoader = new ProcessCSV('../../csv/2014_BERDO.csv');

    const fieldSets = {
        "fieldSets": [
            {
                "fields": [
                    {
                        "field": "ID",
                        "type": "TEXT"
                    },
                    {
                        "field": "Rank",
                        "type": "INTEGER"
                    },
                    {
                        "field": "Property Name",
                        "type": "TEXT"
                    },
                    {
                        "field": "Consolidated Property Types",
                        "shortName": "Type",
                        "type": "TEXT"
                    },
                    {
                        "field": "Floor Area (ft^2)",
                        "shortName": "Floor Area",
                        "type": "DECIMAL"
                    },
                    {
                        "field": "ENERGY STAR Score",
                        "type": "DECIMAL"
                    },
                    {
                        "field": "Site EUI (kBtu/ft^2)",
                        "shortName": "Site EUI",
                        "type": "DECIMAL"
                    }
                ]
            }
        ]
    };

    dataLoader.processFields(fieldSets).then(function () {
        dataLoader.saveJson('../../data/buildings.json');
    });
}

processBuilding();

// Property Name
// Consolidated Property Types
// Address
// City
// County
// State
// ZIP Code
// Floor Area (ft^2)
// Year Built
// Benchmarking Year
// ENERGY STAR Score
// Site EUI (kBtu/ft^2)
// Source EUI (kBtu/ft^2)
// Weather Normalized Site EUI (kBtu/ft^2)
// Weather Normalized Source EUI (kBtu/ft^2)
// Direct GHG Emissions (MtCO2e)
// Indirect GHG Emissions (MtCO2e)
// Total GHG Emissions (MtCO2e)
// Water Use Intensity (gal/ft^2)
// ENERGY STAR Certification Years
// Tax Parcel