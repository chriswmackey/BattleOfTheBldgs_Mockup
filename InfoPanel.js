/**
 * @class SAS.InfoPanel
 **/
var InfoPanel = function ($holder) {
    var _self = this;

    //region private fields and methods
    var _$holder = $holder;
    var _$properties;
    var _activeColor;

    /** @type {Array} */
    var _numericProps;
    /** @type {Array} */
    var _textProps;

    var _init = function () {
        _$properties = $('<div class="properties-list">').appendTo(_$holder);
    };

    var _formatDollar = function (val) {
        return '$' + _formatThousands(val);
    };

    var _formatThousands = function (val) {
        return val.toLocaleString();
    };

    var _valueDiv = function (val) {
        if (!val) val = '-';
        return $('<div class="info-panel-val">').text(val);
    };

    var _valueDivFn = function (fn) {
        return function (val) {
            return _valueDiv(fn(val));
        };
    };

    var _addProp = function (properties, prop, label, fn) {
        var $row = $('<div class="info-panel-row">').appendTo(_$properties);
        var $iconBox = $('<div class="info-panel-icon">').appendTo($row);
        if (_colorProperty === prop) {
            $('<div class="info-panel-color">').css('backgroundColor', _activeColor).appendTo($iconBox);
        }
        $('<div class="info-panel-label">').text(label || prop).appendTo($row);
        var val = properties[prop];
        fn = fn || _valueDiv;
        fn(val).appendTo($row)
    };

    var _showProperties = function (properties, color) {
        _activeColor = color;
        if (!properties) return;
        _$properties.empty();

        $.each(_textProps, function (i, prop) {
            if (typeof prop === 'string') {
                _addProp(properties, prop);
            } else {
                _addProp(properties, prop[0], prop[1]);
            }
        });

        $.each(_numericProps, function (i, prop) {
            _addProp(properties, prop);
        });
    };
    //endregion

    //region protected fields and methods (use 'p_' to differentiate).
    this.p_this = function () {
        return _self;
    };
    //endregion

    //region public API
    this.showProperties = function (properties, color) {
        _showProperties(properties, color);
    };

    /** @type {String} */
    var _colorProperty;
    /**
     * @param {String} [colorProperty]
     * @return {String|SAS.InfoPanel}
     */
    this.colorProperty = function (colorProperty) {
        if (!arguments.length) {
            return _colorProperty;
        }
        _colorProperty = colorProperty;
        return _self.p_this();
    };

    /** @type {String} */
    var _sizeProperty;
    /**
     * @param {String} [sizeProperty]
     * @return {String|SAS.InfoPanel}
     */
    this.sizeProperty = function (sizeProperty) {
        if (!arguments.length) {
            return _sizeProperty;
        }
        _sizeProperty = sizeProperty;
        return _self.p_this();
    };

    /**
     * @param {Array} [numericProps]
     * @return {Array|SAS.InfoPanel}
     */
    this.numericProps = function (numericProps) {
        if (!arguments.length) {
            return _numericProps;
        }
        _numericProps = numericProps;
        return _self;
    };
    /**
     * @param {Array} [textProps]
     * @return {Array|SAS.InfoPanel}
     */
    this.textProps = function (textProps) {
        if (!arguments.length) {
            return _textProps;
        }
        _textProps = textProps;
        return _self;
    };
    //endregion

    _init();
};