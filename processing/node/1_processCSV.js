const ProcessCSV = require('./ProcessCSV').ProcessCSV;

function processBuilding() {
    const dataLoader = new ProcessCSV('../../csv/master2.csv');

    const fieldSets = {
        "fieldSets": [
            {
                "fields": [
                    {
                        "field": "Property Name",
                        "type": "TEXT"
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