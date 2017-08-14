var showInfo = function () {
    console.log('showInfo: data not ready...');
};


$(document).ready(function () {
    var $infoPanel = $('<div class="info-panel">').appendTo('body');
    var infoPanel = new InfoPanel($infoPanel);
    infoPanel
        .textProps(['Property Name', 'Type'])
        .numericProps(['Rank', 'Floor Area', 'ENERGY STAR Score', 'Site EUI'])
        .colorProperty('Type');

    $.getJSON('./data/buildings.json', function (data) {
        var buildingsById = {};
        data.forEach(function (building, i) {
            buildingsById[building.ID] = building;
        });
        showInfo = function (id) {
            var building = buildingsById[id];
            var type = building.ID.split('_')[0];
            infoPanel.showProperties(building, typeColors[type]);
        };
    });
});