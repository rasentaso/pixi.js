var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25
var glslify  = require('glslify');

/**
 * The ColorMatrixFilter class lets you apply a 5x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * ```js
 *  var colorMatrix = new PIXI.ColorMatrixFilter();
 *  container.filters = [colorMatrix];
 *  colorMatrix.contrast(2);
 * ```
 * @author Clément Chenebault <clement@goodboydigital.com>
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function ColorMatrixFilter()
{
    core.Filter.call(this,
        // vertex shader
        glslify('./colorMatrix.vert'),
        // fragment shader
        glslify('./colorMatrix.frag')
    );

    this.uniforms.m = [
                    1, 0, 0, 0, 0,
                    0, 1, 0, 0, 0,
                    0, 0, 1, 0, 0,
                    0, 0, 0, 1, 0];


}

ColorMatrixFilter.prototype = Object.create(core.Filter.prototype);
ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
module.exports = ColorMatrixFilter;


/**
 * Transforms current matrix and set the new one
 *
 * @param matrix {number[]} (mat 5x4)
 * @param multiply {boolean} if true, current matrix and matrix are multiplied. If false, just set the current matrix with @param matrix
 */
ColorMatrixFilter.prototype._loadMatrix = function (matrix, multiply)
{
    multiply = !!multiply;

    var newMatrix = matrix;

    if (multiply) {
        this._multiply(newMatrix, this.uniforms.m, matrix);
        newMatrix = this._colorMatrix(newMatrix);
    }

    // set the new matrix
    this.uniforms.m = newMatrix;
};

/**
 * Multiplies two mat5's
 *
 * @param out {number[]} (mat 5x4) the receiving matrix
 * @param a {number[]} (mat 5x4) the first operand
 * @param b {number[]} (mat 5x4) the second operand
 * @returns out {number[]} (mat 5x4)
 */
ColorMatrixFilter.prototype._multiply = function (out, a, b)
{

    // Red Channel
    out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
    out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
    out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
    out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
    out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]);

    // Green Channel
    out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
    out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
    out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
    out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
    out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]);

    // Blue Channel
    out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
    out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
    out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
    out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
    out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]);

    // Alpha Channel
    out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
    out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
    out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
    out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
    out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]);

    return out;
};

/**
 * Create a Float32 Array and normalize the offset component to 0-1
 *
 * @param matrix {number[]} (mat 5x4)
 * @return m {number[]} (mat 5x4) with all values between 0-1
 */
ColorMatrixFilter.prototype._colorMatrix = function (matrix)
{
    // Create a Float32 Array and normalize the offset component to 0-1
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    return m;
};

/**
 * Adjusts brightness
 *
 * @param b {number} value of the brigthness (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.brightness = function (b, multiply)
{
    var matrix = [
        b, 0, 0, 0, 0,
        0, b, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the matrices in grey scales
 *
 * @param scale {number} value of the grey (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.greyscale = function (scale, multiply)
{
    var matrix = [
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};
//Americanized alias
ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;

/**
 * Set the black and white matrice
 * Multiply the current matrix
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.blackAndWhite = function (multiply)
{
    var matrix = [
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the hue property of the color
 *
 * @param rotation {number} in degrees
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.hue = function (rotation, multiply)
{
    rotation = (rotation || 0) / 180 * Math.PI;
   
    var cosR = Math.cos(rotation),
        sinR = Math.sin(rotation),
        sqrt = Math.sqrt;
 
    /*a good approximation for hue rotation
    This matrix is far better than the versions with magic luminance constants
    formerly used here, but also used in the starling framework (flash) and known from this
    old part of the internet: quasimondo.com/archives/000565.php
        
    This new matrix is based on rgb cube rotation in space. Look here for a more descriptive
    implementation as a shader not a general matrix:
    https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/adjust/huesaturation.js
    
    This is the source for the code:
    see http://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color/8510751#8510751
    */
    
    var w = 1/3, sqrW = sqrt(w);//weight is

    var a00 = cosR + (1.0 - cosR) * w;
    var a01 = w * (1.0 - cosR) - sqrW * sinR;
    var a02 = w * (1.0 - cosR) + sqrW * sinR;
    
    var a10 = w * (1.0 - cosR) + sqrW * sinR;
    var a11 = cosR + w*(1.0 - cosR);
    var a12 = w * (1.0 - cosR) - sqrW * sinR;
    
    var a20 = w * (1.0 - cosR) - sqrW * sinR;
    var a21 = w * (1.0 - cosR) + sqrW * sinR;
    var a22 = cosR + w * (1.0 - cosR);


    var matrix = [
      a00, a01, a02, 0, 0,
      a10, a11, a12, 0, 0,
      a20, a21, a22, 0, 0,
      0, 0, 0, 1, 0,
    ];

    this._loadMatrix(matrix, multiply);
};


/**
 * Set the contrast matrix, increase the separation between dark and bright
 * Increase contrast : shadows darker and highlights brighter
 * Decrease contrast : bring the shadows up and the highlights down
 *
 * @param amount {number} value of the contrast
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.contrast = function (amount, multiply)
{
    var v = (amount || 0) + 1;
    var o = -128 * (v - 1);

    var matrix = [
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the saturation matrix, increase the separation between colors
 * Increase saturation : increase contrast, brightness, and sharpness
 *
 * @param [amount=0] {number}
 * @param [multiply] {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.saturate = function (amount, multiply)
{
    var x = (amount || 0) * 2 / 3 + 1;
    var y = ((x - 1) * -0.5);

    var matrix = [
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Desaturate image (remove color)
 *
 * Call the saturate function
 *
 */
ColorMatrixFilter.prototype.desaturate = function () // jshint unused:false
{
    this.saturate(-1);
};

/**
 * Negative image (inverse of classic rgb matrix)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.negative = function (multiply)
{
    var matrix = [
        0, 1, 1, 0, 0,
        1, 0, 1, 0, 0,
        1, 1, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Sepia image
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.sepia = function (multiply)
{
    var matrix = [
        0.393, 0.7689999, 0.18899999, 0, 0,
        0.349, 0.6859999, 0.16799999, 0, 0,
        0.272, 0.5339999, 0.13099999, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color motion picture process invented in 1916 (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.technicolor = function (multiply)
{
    var matrix = [
        1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
        -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
        -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Polaroid filter
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.polaroid = function (multiply)
{
    var matrix = [
        1.438, -0.062, -0.062, 0, 0,
        -0.122, 1.378, -0.122, 0, 0,
        -0.016, -0.016, 1.483, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Filter who transforms : Red -> Blue and Blue -> Red
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.toBGR = function (multiply)
{
    var matrix = [
        0, 0, 1, 0, 0,
        0, 1, 0, 0, 0,
        1, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color reversal film introduced by Eastman Kodak in 1935. (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.kodachrome = function (multiply)
{
    var matrix = [
        1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
        -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
        -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Brown delicious browni filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.browni = function (multiply)
{
    var matrix = [
        0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
        -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
        0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Vintage filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.vintage = function (multiply)
{
    var matrix = [
        0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
        0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
        0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * We don't know exactly what it does, kind of gradient map, but funny to play with!
 *
 * @param desaturation {number}
 * @param toned {number}
 * @param lightColor {string} (example : "0xFFE580")
 * @param darkColor {string}  (example : "0xFFE580")
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.colorTone = function (desaturation, toned, lightColor, darkColor, multiply)
{
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 0xFFE580;
    darkColor = darkColor || 0x338000;

    var lR = ((lightColor >> 16) & 0xFF) / 255;
    var lG = ((lightColor >> 8) & 0xFF) / 255;
    var lB = (lightColor & 0xFF) / 255;

    var dR = ((darkColor >> 16) & 0xFF) / 255;
    var dG = ((darkColor >> 8) & 0xFF) / 255;
    var dB = (darkColor & 0xFF) / 255;

    var matrix = [
        0.3, 0.59, 0.11, 0, 0,
        lR, lG, lB, desaturation, 0,
        dR, dG, dB, toned, 0,
        lR - dR, lG - dG, lB - dB, 0, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Night effect
 *
 * @param intensity {number}
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.night = function (intensity, multiply)
{
    intensity = intensity || 0.1;
    var matrix = [
        intensity * ( -2.0), -intensity, 0, 0, 0,
        -intensity, 0, intensity, 0, 0,
        0, intensity, intensity * 2.0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};


/*
 * Predator effect
 *
 * Erase the current matrix by setting a new indepent one
 *
 * @param amount {number} how much the predator feels his future victim
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.predator = function (amount, multiply)
{
    var matrix = [
        11.224130630493164 * amount, -4.794486999511719 * amount, -2.8746118545532227 * amount, 0 * amount, 0.40342438220977783 * amount,
        -3.6330697536468506 * amount, 9.193157196044922 * amount, -2.951810836791992 * amount, 0 * amount, -1.316135048866272 * amount,
        -3.2184197902679443 * amount, -4.2375030517578125 * amount, 7.476448059082031 * amount, 0 * amount, 0.8044459223747253 * amount,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * LSD effect
 *
 * Multiply the current matrix
 *
 * @param amount {number} How crazy is your effect
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.lsd = function (multiply)
{
    var matrix = [
        2, -0.4, 0.5, 0, 0,
        -0.5, 2, -0.4, 0, 0,
        -0.4, -0.5, 3, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Erase the current matrix by setting the default one
 *
 */
ColorMatrixFilter.prototype.reset = function ()
{
    var matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, false);
};


Object.defineProperties(ColorMatrixFilter.prototype, {
    /**
     * Sets the matrix of the color matrix filter
     *
     * @member {number[]}
     * @memberof PIXI.filters.ColorMatrixFilter#
     * @default [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.m;
        },
        set: function (value)
        {
            this.uniforms.m = value;
        }
    }
});
